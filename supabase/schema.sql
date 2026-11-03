-- Trúc Khê Tiên Duyên: tài khoản người chơi, lưu nhân vật, bảng xếp hạng
-- Cách dùng: Supabase -> SQL Editor -> dán toàn bộ file này -> Run. Chạy lại nhiều lần cũng không sao.
-- Chỉ tạo các bảng/hàm có tiền tố tk_, không đụng tới dữ liệu khác trong dự án.
create extension if not exists pgcrypto with schema extensions;

-- ========== Lưu theo mã khôi phục (bản cũ, vẫn giữ để tài khoản GM và mã khôi phục dùng được) ==========
create table if not exists public.tk_players (
  id          text primary key,
  secret_hash text not null,
  name        text not null,
  sect        text not null,
  lv          int  not null default 1,
  exp         bigint not null default 0,
  data        jsonb,
  updated_at  timestamptz not null default now()
);
alter table public.tk_players enable row level security;
revoke all on public.tk_players from anon, authenticated;

create or replace function public.tk_save(p_id text, p_secret text, p_name text, p_sect text, p_lv int, p_exp bigint, p_data jsonb)
returns boolean language plpgsql security definer set search_path = public, extensions as $$
declare cur text;
begin
  if length(p_id) <> 8 or length(p_secret) <> 12 then return false; end if;
  if p_lv < 1 or p_lv > 250 or length(p_name) > 20 then return false; end if;
  if pg_column_size(p_data) > 300000 then return false; end if;
  select secret_hash into cur from tk_players where id = p_id;
  if cur is null then
    insert into tk_players(id, secret_hash, name, sect, lv, exp, data)
    values (p_id, crypt(p_secret, gen_salt('bf')), left(p_name, 20), left(p_sect, 10), p_lv, p_exp, p_data);
    return true;
  elsif cur = crypt(p_secret, cur) then
    update tk_players set name = left(p_name, 20), sect = left(p_sect, 10), lv = p_lv, exp = p_exp, data = p_data, updated_at = now() where id = p_id;
    return true;
  end if;
  return false;
end $$;

create or replace function public.tk_load(p_id text, p_secret text)
returns jsonb language plpgsql security definer set search_path = public, extensions as $$
declare r tk_players;
begin
  select * into r from tk_players where id = p_id;
  if r.id is null or r.secret_hash <> crypt(p_secret, r.secret_hash) then return null; end if;
  return r.data;
end $$;

-- ========== Tài khoản: đăng nhập ở máy nào cũng được ==========
-- Mật khẩu chỉ lưu dạng băm bcrypt. Mỗi lần đăng nhập cấp một phiên (token) mới;
-- máy đăng nhập trước sẽ không lưu đè được nữa (tránh hai máy ghi đè nhân vật của nhau).
create table if not exists public.tk_accounts (
  username   text primary key check (username ~ '^[a-z0-9_]{3,16}$'),
  pass_hash  text not null,
  token      text,
  name       text,
  sect       text,
  lv         int not null default 0,
  exp        bigint not null default 0,
  data       jsonb,
  data_ts    bigint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.tk_accounts enable row level security;
revoke all on public.tk_accounts from anon, authenticated;

create or replace function public.tk_acc_register(p_user text, p_pass text)
returns text language plpgsql security definer set search_path = public, extensions as $$
begin
  p_user := lower(trim(p_user));
  if p_user !~ '^[a-z0-9_]{3,16}$' then raise exception 'bad_user'; end if;
  if p_user = 'khatmau01' then raise exception 'taken'; end if;  -- tên dành riêng cho GM
  if length(p_pass) < 4 or length(p_pass) > 72 then raise exception 'bad_pass'; end if;
  insert into tk_accounts(username, pass_hash) values (p_user, crypt(p_pass, gen_salt('bf', 8)))
  on conflict (username) do nothing;
  if not found then raise exception 'taken'; end if;
  return 'ok';
end $$;

create or replace function public.tk_acc_login(p_user text, p_pass text)
returns jsonb language plpgsql security definer set search_path = public, extensions as $$
declare r tk_accounts; t text;
begin
  select * into r from tk_accounts where username = lower(trim(p_user));
  if r.username is null then raise exception 'no_user'; end if;
  if r.pass_hash <> crypt(p_pass, r.pass_hash) then raise exception 'bad_pass'; end if;
  t := encode(gen_random_bytes(18), 'hex');
  update tk_accounts set token = t where username = r.username;
  return jsonb_build_object('token', t, 'data', r.data, 'ts', r.data_ts);
end $$;

create or replace function public.tk_acc_save(p_user text, p_token text, p_data jsonb, p_ts bigint)
returns text language plpgsql security definer set search_path = public, extensions as $$
begin
  if pg_column_size(p_data) > 300000 then raise exception 'too_big'; end if;
  update tk_accounts set data = p_data, data_ts = p_ts,
    name = left(p_data->>'name', 20), sect = left(p_data->>'sect', 10),
    lv = least(greatest(coalesce((p_data->>'lv')::int, 0), 0), 250), exp = coalesce((p_data->>'exp')::bigint, 0),
    updated_at = now()
  where username = lower(trim(p_user)) and token = p_token;
  if not found then raise exception 'session'; end if;
  return 'ok';
end $$;

create or replace function public.tk_acc_passwd(p_user text, p_old text, p_new text)
returns text language plpgsql security definer set search_path = public, extensions as $$
declare r tk_accounts;
begin
  select * into r from tk_accounts where username = lower(trim(p_user));
  if r.username is null or r.pass_hash <> crypt(p_old, r.pass_hash) then raise exception 'bad_pass'; end if;
  if length(p_new) < 4 or length(p_new) > 72 then raise exception 'bad_new'; end if;
  update tk_accounts set pass_hash = crypt(p_new, gen_salt('bf', 8)), token = null where username = r.username;
  return 'ok';
end $$;

-- ========== Bảng xếp hạng (tài khoản + bản lưu cũ; bỏ GM) ==========
create or replace function public.tk_top()
returns table(name text, sect text, lv int, exp bigint) language sql security definer set search_path = public, extensions as $$
  select name, sect, lv, exp from (
    select name, sect, lv, exp, updated_at from tk_accounts where name is not null and lv > 0
    union all
    select name, sect, lv, exp, updated_at from tk_players where sect <> 'GM'
  ) x order by lv desc, exp desc, updated_at asc limit 50;
$$;

grant execute on function public.tk_save(text, text, text, text, int, bigint, jsonb) to anon;
grant execute on function public.tk_load(text, text) to anon;
grant execute on function public.tk_acc_register(text, text) to anon;
grant execute on function public.tk_acc_login(text, text) to anon;
grant execute on function public.tk_acc_save(text, text, jsonb, bigint) to anon;
grant execute on function public.tk_acc_passwd(text, text, text) to anon;
grant execute on function public.tk_top() to anon;

-- ========== Lôi đài: bảng xếp hạng theo mùa (điểm lưu trong dữ liệu nhân vật) ==========
create or replace function public.tk_pvp_top(p_season text)
returns table(name text, lv int, r int, w int, l int) language sql security definer set search_path = public, extensions as $$
  select name, lv, coalesce((data->'pvp'->>'r')::int, 1000) as r, coalesce((data->'pvp'->>'sw')::int, 0) as w, coalesce((data->'pvp'->>'sl')::int, 0) as l
  from tk_accounts where name is not null and data->'pvp'->>'s' = p_season
    and coalesce((data->'pvp'->>'sw')::int, 0) + coalesce((data->'pvp'->>'sl')::int, 0) > 0
  order by r desc, w desc limit 30;
$$;
grant execute on function public.tk_pvp_top(text) to anon;

-- ========== Bang hội ==========
create table if not exists public.tk_guilds (
  id         serial primary key,
  name       text not null unique,
  leader     text not null,
  notice     text not null default '',
  lv         int not null default 1,
  exp        bigint not null default 0,
  members    jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);
alter table public.tk_guilds enable row level security;
revoke all on public.tk_guilds from anon, authenticated;

create or replace function public.tk_auth(p_user text, p_token text)
returns boolean language sql security definer set search_path = public, extensions as $$
  select exists(select 1 from tk_accounts where username = lower(trim(p_user)) and token = p_token and token is not null);
$$;

create or replace function public.tk_g_mine(p_user text)
returns jsonb language sql security definer set search_path = public, extensions as $$
  select to_jsonb(g) from tk_guilds g where g.members @> jsonb_build_array(jsonb_build_object('u', lower(trim(p_user)))) limit 1;
$$;

create or replace function public.tk_g_list()
returns table(id int, name text, lv int, cnt int, leader text) language sql security definer set search_path = public, extensions as $$
  select id, name, lv, jsonb_array_length(members), leader from tk_guilds order by lv desc, exp desc limit 50;
$$;

create or replace function public.tk_g_create(p_user text, p_token text, p_name text, p_cname text)
returns jsonb language plpgsql security definer set search_path = public, extensions as $$
declare u text := lower(trim(p_user)); n text := trim(p_name); g tk_guilds;
begin
  if not tk_auth(u, p_token) then raise exception 'session'; end if;
  if length(n) < 2 or length(n) > 16 then raise exception 'bad_name'; end if;
  if tk_g_mine(u) is not null then raise exception 'in_guild'; end if;
  if exists(select 1 from tk_guilds where lower(name) = lower(n)) then raise exception 'taken'; end if;
  insert into tk_guilds(name, leader, members) values (n, u, jsonb_build_array(jsonb_build_object('u', u, 'n', left(p_cname, 14), 'c', 0)))
  returning * into g;
  return to_jsonb(g);
end $$;

create or replace function public.tk_g_join(p_user text, p_token text, p_id int, p_cname text)
returns jsonb language plpgsql security definer set search_path = public, extensions as $$
declare u text := lower(trim(p_user)); g tk_guilds;
begin
  if not tk_auth(u, p_token) then raise exception 'session'; end if;
  if tk_g_mine(u) is not null then raise exception 'in_guild'; end if;
  select * into g from tk_guilds where id = p_id for update;
  if g.id is null then raise exception 'no_guild'; end if;
  if jsonb_array_length(g.members) >= 20 + g.lv * 3 then raise exception 'full'; end if;
  update tk_guilds set members = members || jsonb_build_array(jsonb_build_object('u', u, 'n', left(p_cname, 14), 'c', 0)) where id = p_id returning * into g;
  return to_jsonb(g);
end $$;

create or replace function public.tk_g_leave(p_user text, p_token text)
returns text language plpgsql security definer set search_path = public, extensions as $$
declare u text := lower(trim(p_user)); g tk_guilds; rest jsonb;
begin
  if not tk_auth(u, p_token) then raise exception 'session'; end if;
  select * into g from tk_guilds where members @> jsonb_build_array(jsonb_build_object('u', u)) for update;
  if g.id is null then return 'ok'; end if;
  select coalesce(jsonb_agg(m), '[]'::jsonb) into rest from jsonb_array_elements(g.members) m where m->>'u' <> u;
  if jsonb_array_length(rest) = 0 then delete from tk_guilds where id = g.id; return 'disband'; end if;
  update tk_guilds set members = rest, leader = case when leader = u then rest->0->>'u' else leader end where id = g.id;
  return 'ok';
end $$;

create or replace function public.tk_g_kick(p_user text, p_token text, p_target text)
returns jsonb language plpgsql security definer set search_path = public, extensions as $$
declare u text := lower(trim(p_user)); g tk_guilds;
begin
  if not tk_auth(u, p_token) then raise exception 'session'; end if;
  select * into g from tk_guilds where leader = u for update;
  if g.id is null then raise exception 'not_leader'; end if;
  if p_target = u then raise exception 'self'; end if;
  update tk_guilds set members = (select coalesce(jsonb_agg(m), '[]'::jsonb) from jsonb_array_elements(g.members) m where m->>'u' <> p_target) where id = g.id returning * into g;
  return to_jsonb(g);
end $$;

create or replace function public.tk_g_donate(p_user text, p_token text, p_amount bigint, p_cname text)
returns jsonb language plpgsql security definer set search_path = public, extensions as $$
declare u text := lower(trim(p_user)); g tk_guilds; e bigint;
begin
  if not tk_auth(u, p_token) then raise exception 'session'; end if;
  if p_amount < 1 or p_amount > 100000000 then raise exception 'bad_amount'; end if;
  select * into g from tk_guilds where members @> jsonb_build_array(jsonb_build_object('u', u)) for update;
  if g.id is null then raise exception 'no_guild'; end if;
  e := g.exp + p_amount;
  update tk_guilds set exp = e, lv = least(10, 1 + floor(sqrt(e / 2000000.0))::int),
    members = (select jsonb_agg(case when m->>'u' = u then m || jsonb_build_object('c', coalesce((m->>'c')::bigint, 0) + p_amount, 'n', left(p_cname, 14)) else m end) from jsonb_array_elements(g.members) m)
  where id = g.id returning * into g;
  return to_jsonb(g);
end $$;

create or replace function public.tk_g_notice(p_user text, p_token text, p_text text)
returns jsonb language plpgsql security definer set search_path = public, extensions as $$
declare u text := lower(trim(p_user)); g tk_guilds;
begin
  if not tk_auth(u, p_token) then raise exception 'session'; end if;
  update tk_guilds set notice = left(coalesce(p_text, ''), 200) where leader = u returning * into g;
  if g.id is null then raise exception 'not_leader'; end if;
  return to_jsonb(g);
end $$;

grant execute on function public.tk_g_mine(text) to anon;
grant execute on function public.tk_g_list() to anon;
grant execute on function public.tk_g_create(text, text, text, text) to anon;
grant execute on function public.tk_g_join(text, text, int, text) to anon;
grant execute on function public.tk_g_leave(text, text) to anon;
grant execute on function public.tk_g_kick(text, text, text) to anon;
grant execute on function public.tk_g_donate(text, text, bigint, text) to anon;
grant execute on function public.tk_g_notice(text, text, text) to anon;
