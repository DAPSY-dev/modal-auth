-- Run after the migration in the SQL editor. All synthetic records are rolled back.
begin;
do $$
declare
  first_id uuid := gen_random_uuid();
  second_id uuid := gen_random_uuid();
  test_username text := 'ut_' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 12);
  result jsonb;
begin
  if has_function_privilege('anon', 'public.resolve_username_login(text)', 'EXECUTE')
    or has_function_privilege('authenticated', 'public.resolve_username_login(text)', 'EXECUTE') then
    raise exception 'Email resolver must not be callable by browser roles';
  end if;
  if has_schema_privilege('anon', 'private', 'USAGE')
    or has_schema_privilege('authenticated', 'private', 'USAGE') then
    raise exception 'Private tables must not be accessible to browser roles';
  end if;
  insert into auth.users(id, email, raw_user_meta_data)
    values (first_id, test_username || '@example.invalid', jsonb_build_object('username', upper(test_username)));
  if public.is_username_available(upper(test_username)) then
    raise exception 'Username availability must be case insensitive';
  end if;
  begin
    insert into auth.users(id, email, raw_user_meta_data)
      values (second_id, 'duplicate@example.invalid', jsonb_build_object('username', test_username));
    raise exception 'Duplicate username was accepted';
  exception when unique_violation then null;
  end;
  begin
    insert into auth.users(id, email, raw_user_meta_data)
      values (second_id, 'invalid@example.invalid', '{"username":"bad name"}'::jsonb);
    raise exception using errcode = '23514', message = 'Invalid username was accepted';
  exception when raise_exception then null;
  end;
  -- Mutable user metadata cannot reassign the immutable login identity.
  update auth.users set raw_user_meta_data = '{"username":"different_name"}'::jsonb where id = first_id;
  result := public.resolve_username_login(upper(test_username));
  if result ->> 'email' is distinct from test_username || '@example.invalid' then
    raise exception 'Username identity was not preserved';
  end if;
  for attempt in 2..11 loop
    result := public.resolve_username_login(test_username);
  end loop;
  if (result ->> 'allowed')::boolean then raise exception 'Rate limit was not enforced'; end if;
end;
$$;
rollback;
