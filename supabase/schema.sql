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
  if p_lv < 1 or p_lv > 99 or length(p_name) > 20 then return false; end if;
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
    lv = least(greatest(coalesce((p_data->>'lv')::int, 0), 0), 99), exp = coalesce((p_data->>'exp')::bigint, 0),
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
