begin;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table private.usernames (
  user_id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique check (username ~ '^[a-z0-9_]{3,30}$')
);
alter table private.usernames enable row level security;
revoke all on private.usernames from public, anon, authenticated;

-- Identity ownership is established atomically with signup, never from editable metadata later.
create function private.register_username()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  requested_username text := lower(trim(new.raw_user_meta_data ->> 'username'));
begin
  if requested_username is null or requested_username !~ '^[a-z0-9_]{3,30}$' then
    raise exception 'A valid username is required';
  end if;
  insert into private.usernames(user_id, username) values (new.id, requested_username);
  return new;
end;
$$;
revoke all on function private.register_username() from public, anon, authenticated;
create trigger register_username after insert on auth.users
  for each row execute function private.register_username();

-- This reveals availability only, never an email, user ID, or account details.
create function public.is_username_available(requested_username text)
returns boolean language sql stable security definer set search_path = '' as $$
  select coalesce(lower(trim(requested_username)) ~ '^[a-z0-9_]{3,30}$', false)
    and not exists (
      select 1 from private.usernames where username = lower(trim(requested_username))
    );
$$;
revoke all on function public.is_username_available(text) from public;
grant execute on function public.is_username_available(text) to anon, authenticated;

create table private.username_login_attempts (
  username text primary key,
  window_start timestamptz not null,
  attempts integer not null
);
alter table private.username_login_attempts enable row level security;
revoke all on private.username_login_attempts from public, anon, authenticated;

-- Called only by the Edge Function. Limits unknown names too, before resolving an email.
create function public.resolve_username_login(requested_username text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  normalized text := lower(trim(requested_username));
  attempt_count integer;
  resolved_email text;
begin
  if normalized is null or normalized !~ '^[a-z0-9_]{3,30}$' then
    return jsonb_build_object('allowed', false);
  end if;
  delete from private.username_login_attempts where window_start < now() - interval '1 day';
  insert into private.username_login_attempts as limits(username, window_start, attempts)
    values (normalized, now(), 1)
  on conflict (username) do update set
    window_start = case when limits.window_start < now() - interval '5 minutes' then now() else limits.window_start end,
    attempts = case when limits.window_start < now() - interval '5 minutes' then 1 else least(limits.attempts + 1, 11) end
  returning attempts into attempt_count;
  if attempt_count > 10 then
    return jsonb_build_object('allowed', false);
  end if;
  select u.email into resolved_email
    from private.usernames names join auth.users u on u.id = names.user_id
    where names.username = normalized;
  return jsonb_build_object('allowed', true, 'email', resolved_email);
end;
$$;
revoke all on function public.resolve_username_login(text) from public, anon, authenticated;
grant execute on function public.resolve_username_login(text) to service_role;

commit;
