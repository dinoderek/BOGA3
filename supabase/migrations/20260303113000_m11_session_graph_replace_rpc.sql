-- M11 session-graph parity extension:
-- - aggregate session graph replace RPC for authenticated sync writes
-- - optimistic stale-write detection using sessions.updated_at
-- - omitted nested children are deleted as part of graph replacement

create or replace function app_public.replace_session_graph(
  p_session jsonb,
  p_exercises jsonb default '[]'::jsonb,
  p_expected_updated_at bigint default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor_user_id uuid := auth.uid();
  v_session_id text := nullif(btrim(coalesce(p_session ->> 'id', '')), '');
  v_existing_session app_public.sessions%rowtype;
  v_session_row app_public.sessions%rowtype;
  v_exercise jsonb;
  v_set jsonb;
  v_exercise_position integer;
  v_set_position integer;
  v_exercise_id text;
  v_set_id text;
  v_sets jsonb;
  v_response jsonb;
  v_has_gym_id boolean := p_session ? 'gym_id';
  v_has_status boolean := p_session ? 'status';
  v_has_started_at boolean := p_session ? 'started_at';
  v_has_completed_at boolean := p_session ? 'completed_at';
  v_has_duration_sec boolean := p_session ? 'duration_sec';
  v_has_deleted_at boolean := p_session ? 'deleted_at';
  v_has_created_at boolean := p_session ? 'created_at';
  v_has_updated_at boolean := p_session ? 'updated_at';
  v_session_gym_id text := nullif(btrim(coalesce(p_session ->> 'gym_id', '')), '');
  v_session_status text := nullif(btrim(coalesce(p_session ->> 'status', '')), '');
  v_session_started_at bigint;
  v_session_completed_at bigint;
  v_session_duration_sec integer;
  v_session_deleted_at bigint;
  v_session_created_at bigint;
  v_session_updated_at bigint;
begin
  if v_actor_user_id is null then
    raise exception using
      errcode = 'P0001',
      message = 'AUTH_REQUIRED',
      detail = 'replace_session_graph requires an authenticated user.';
  end if;

  if p_session is null or jsonb_typeof(p_session) <> 'object' then
    raise exception using
      errcode = 'P0001',
      message = 'VALIDATION_FAILED',
      detail = 'p_session must be a JSON object.';
  end if;

  if v_session_id is null then
    raise exception using
      errcode = 'P0001',
      message = 'VALIDATION_FAILED',
      detail = 'p_session.id is required.';
  end if;

  if p_exercises is null then
    p_exercises := '[]'::jsonb;
  elsif jsonb_typeof(p_exercises) <> 'array' then
    raise exception using
      errcode = 'P0001',
      message = 'VALIDATION_FAILED',
      detail = 'p_exercises must be a JSON array.';
  end if;

  if v_has_started_at and jsonb_typeof(p_session -> 'started_at') <> 'null' then
    v_session_started_at := (p_session ->> 'started_at')::bigint;
  end if;

  if v_has_completed_at and jsonb_typeof(p_session -> 'completed_at') <> 'null' then
    v_session_completed_at := (p_session ->> 'completed_at')::bigint;
  end if;

  if v_has_duration_sec and jsonb_typeof(p_session -> 'duration_sec') <> 'null' then
    v_session_duration_sec := (p_session ->> 'duration_sec')::integer;
  end if;

  if v_has_deleted_at and jsonb_typeof(p_session -> 'deleted_at') <> 'null' then
    v_session_deleted_at := (p_session ->> 'deleted_at')::bigint;
  end if;

  if v_has_created_at and jsonb_typeof(p_session -> 'created_at') <> 'null' then
    v_session_created_at := (p_session ->> 'created_at')::bigint;
  end if;

  if not v_has_updated_at or jsonb_typeof(p_session -> 'updated_at') = 'null' then
    raise exception using
      errcode = 'P0001',
      message = 'VALIDATION_FAILED',
      detail = 'p_session.updated_at is required.';
  end if;
  v_session_updated_at := (p_session ->> 'updated_at')::bigint;

  select *
  into v_existing_session
  from app_public.sessions
  where id = v_session_id;

  if found and v_existing_session.owner_user_id <> v_actor_user_id then
    raise exception using
      errcode = 'P0001',
      message = 'SESSION_GRAPH_NOT_FOUND_OR_DENIED',
      detail = 'The requested session graph is not available to this user.';
  end if;

  if found then
    if p_expected_updated_at is null or v_existing_session.updated_at <> p_expected_updated_at then
      raise exception using
        errcode = 'P0001',
        message = 'SESSION_GRAPH_STALE',
        detail = 'The remote session graph changed since the caller last synced it.';
    end if;

    update app_public.sessions
    set gym_id = case when v_has_gym_id then v_session_gym_id else v_existing_session.gym_id end,
        status = case when v_has_status then coalesce(v_session_status, v_existing_session.status) else v_existing_session.status end,
        started_at = case when v_has_started_at then coalesce(v_session_started_at, v_existing_session.started_at) else v_existing_session.started_at end,
        completed_at = case when v_has_completed_at then v_session_completed_at else v_existing_session.completed_at end,
        duration_sec = case when v_has_duration_sec then v_session_duration_sec else v_existing_session.duration_sec end,
        deleted_at = case when v_has_deleted_at then v_session_deleted_at else v_existing_session.deleted_at end,
        updated_at = v_session_updated_at
    where id = v_session_id
      and owner_user_id = v_actor_user_id
    returning * into v_session_row;
  else
    if p_expected_updated_at is not null then
      raise exception using
        errcode = 'P0001',
        message = 'SESSION_GRAPH_STALE',
        detail = 'The remote session graph no longer matches the caller expectation.';
    end if;

    if not v_has_started_at or v_session_started_at is null then
      raise exception using
        errcode = 'P0001',
        message = 'VALIDATION_FAILED',
        detail = 'p_session.started_at is required when creating a session graph.';
    end if;

    insert into app_public.sessions (
      id,
      owner_user_id,
      gym_id,
      status,
      started_at,
      completed_at,
      duration_sec,
      deleted_at,
      created_at,
      updated_at
    )
    values (
      v_session_id,
      v_actor_user_id,
      v_session_gym_id,
      coalesce(v_session_status, 'draft'),
      v_session_started_at,
      v_session_completed_at,
      v_session_duration_sec,
      v_session_deleted_at,
      coalesce(v_session_created_at, v_session_updated_at),
      v_session_updated_at
    )
    returning * into v_session_row;
  end if;

  delete from app_public.exercise_sets
  where owner_user_id = v_actor_user_id
    and session_exercise_id in (
      select id
      from app_public.session_exercises
      where owner_user_id = v_actor_user_id
        and session_id = v_session_id
    );

  delete from app_public.session_exercises
  where owner_user_id = v_actor_user_id
    and session_id = v_session_id;

  for v_exercise, v_exercise_position in
    select value, ordinality::integer - 1
    from jsonb_array_elements(p_exercises) with ordinality
  loop
    if jsonb_typeof(v_exercise) <> 'object' then
      raise exception using
        errcode = 'P0001',
        message = 'VALIDATION_FAILED',
        detail = 'Each exercise payload must be a JSON object.';
    end if;

    v_exercise_id := nullif(btrim(coalesce(v_exercise ->> 'id', '')), '');
    if v_exercise_id is null then
      raise exception using
        errcode = 'P0001',
        message = 'VALIDATION_FAILED',
        detail = 'Each exercise payload requires an id.';
    end if;

    v_sets := coalesce(v_exercise -> 'sets', '[]'::jsonb);
    if jsonb_typeof(v_sets) <> 'array' then
      raise exception using
        errcode = 'P0001',
        message = 'VALIDATION_FAILED',
        detail = 'Exercise sets payload must be a JSON array.';
    end if;

    insert into app_public.session_exercises (
      id,
      owner_user_id,
      session_id,
      order_index,
      name,
      machine_name,
      origin_scope_id,
      origin_source_id,
      created_at,
      updated_at
    )
    values (
      v_exercise_id,
      v_actor_user_id,
      v_session_id,
      coalesce(nullif(v_exercise ->> 'order_index', '')::integer, v_exercise_position),
      v_exercise ->> 'name',
      case
        when v_exercise ? 'machine_name' and jsonb_typeof(v_exercise -> 'machine_name') <> 'null'
          then v_exercise ->> 'machine_name'
        else null
      end,
      coalesce(nullif(btrim(coalesce(v_exercise ->> 'origin_scope_id', '')), ''), 'private'),
      coalesce(nullif(btrim(coalesce(v_exercise ->> 'origin_source_id', '')), ''), 'local'),
      coalesce(nullif(v_exercise ->> 'created_at', '')::bigint, v_session_row.created_at),
      coalesce(nullif(v_exercise ->> 'updated_at', '')::bigint, v_session_row.updated_at)
    );

    for v_set, v_set_position in
      select value, ordinality::integer - 1
      from jsonb_array_elements(v_sets) with ordinality
    loop
      if jsonb_typeof(v_set) <> 'object' then
        raise exception using
          errcode = 'P0001',
          message = 'VALIDATION_FAILED',
          detail = 'Each set payload must be a JSON object.';
      end if;

      v_set_id := nullif(btrim(coalesce(v_set ->> 'id', '')), '');
      if v_set_id is null then
        raise exception using
          errcode = 'P0001',
          message = 'VALIDATION_FAILED',
          detail = 'Each set payload requires an id.';
      end if;

      insert into app_public.exercise_sets (
        id,
        owner_user_id,
        session_exercise_id,
        order_index,
        weight_value,
        reps_value,
        created_at,
        updated_at
      )
      values (
        v_set_id,
        v_actor_user_id,
        v_exercise_id,
        coalesce(nullif(v_set ->> 'order_index', '')::integer, v_set_position),
        coalesce(v_set ->> 'weight_value', ''),
        coalesce(v_set ->> 'reps_value', ''),
        coalesce(nullif(v_set ->> 'created_at', '')::bigint, v_session_row.created_at),
        coalesce(nullif(v_set ->> 'updated_at', '')::bigint, v_session_row.updated_at)
      );
    end loop;
  end loop;

  select jsonb_build_object(
    'session',
    to_jsonb(s) - 'owner_user_id',
    'exercises',
    coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'id', sx.id,
            'session_id', sx.session_id,
            'order_index', sx.order_index,
            'name', sx.name,
            'machine_name', sx.machine_name,
            'origin_scope_id', sx.origin_scope_id,
            'origin_source_id', sx.origin_source_id,
            'created_at', sx.created_at,
            'updated_at', sx.updated_at,
            'sets',
            coalesce(
              (
                select jsonb_agg(
                  jsonb_build_object(
                    'id', es.id,
                    'session_exercise_id', es.session_exercise_id,
                    'order_index', es.order_index,
                    'weight_value', es.weight_value,
                    'reps_value', es.reps_value,
                    'created_at', es.created_at,
                    'updated_at', es.updated_at
                  )
                  order by es.order_index
                )
                from app_public.exercise_sets es
                where es.owner_user_id = v_actor_user_id
                  and es.session_exercise_id = sx.id
              ),
              '[]'::jsonb
            )
          )
          order by sx.order_index
        )
        from app_public.session_exercises sx
        where sx.owner_user_id = v_actor_user_id
          and sx.session_id = s.id
      ),
      '[]'::jsonb
    )
  )
  into v_response
  from app_public.sessions s
  where s.id = v_session_id
    and s.owner_user_id = v_actor_user_id;

  return v_response;
end;
$$;

revoke all on function app_public.replace_session_graph(jsonb, jsonb, bigint) from public;
grant execute on function app_public.replace_session_graph(jsonb, jsonb, bigint) to anon, authenticated, service_role;

comment on function app_public.replace_session_graph(jsonb, jsonb, bigint) is
  'Authenticated aggregate session-graph replace RPC for M11 sync parity. Replaces nested exercises/sets atomically and rejects stale writes using sessions.updated_at.';
