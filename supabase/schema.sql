-- Trúc Khê Tiên Duyên: bảng lưu nhân vật + bảng xếp hạng
-- Cách dùng: Supabase -> SQL Editor -> dán toàn bộ file này -> Run. Chạy lại nhiều lần cũng không sao.
create extension if not exists pgcrypto with schema extensions;

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
-- Không cho đọc/ghi trực tiếp bảng; mọi thao tác đi qua 3 hàm bên dưới
alter table public.tk_players enable row level security;
revoke all on public.tk_players from anon, authenticated;

create or replace function public.tk_save(p_id text, p_secret text, p_name text, p_sect text, p_lv int, p_exp bigint, p_data jsonb)
returns boolean language plpgsql security definer set search_path = public, extensions as $$
declare cur text;
begin
  if length(p_id) <> 8 or length(p_secret) <> 12 then return false; end if;
  if p_lv < 1 or p_lv > 70 or length(p_name) > 20 then return false; end if;
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

create or replace function public.tk_top()
returns table(name text, sect text, lv int, exp bigint) language sql security definer set search_path = public, extensions as $$
  select name, sect, lv, exp from tk_players order by lv desc, exp desc, updated_at asc limit 50;
$$;

grant execute on function public.tk_save(text, text, text, text, int, bigint, jsonb) to anon;
grant execute on function public.tk_load(text, text) to anon;
grant execute on function public.tk_top() to anon;
