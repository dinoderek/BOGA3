-- M5 auth/authz/security baseline:
-- - user-owned sync-domain tables in app_public
-- - ownership integrity constraints
-- - RLS deny-by-default with owner policies
-- - local fixture table service-role update grant for auth fixture provisioning

grant update on table public.dev_fixture_principals to service_role;

create table if not exists app_public.gyms (
  id text primary key,
  owner_user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (length(btrim(name)) > 0),
  origin_scope_id text not null default 'private',
  origin_source_id text not null default 'local',
  created_at bigint not null check (created_at >= 0),
  updated_at bigint not null check (updated_at >= 0),
  constraint gyms_id_owner_unique unique (id, owner_user_id)
);

create index if not exists gyms_owner_user_id_idx on app_public.gyms (owner_user_id);
create index if not exists gyms_name_idx on app_public.gyms (name);
create index if not exists gyms_origin_scope_id_idx on app_public.gyms (origin_scope_id);

create table if not exists app_public.sessions (
  id text primary key,
  owner_user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  gym_id text,
  status text not null default 'draft' check (status in ('draft', 'active', 'completed')),
  started_at bigint not null check (started_at >= 0),
  completed_at bigint check (completed_at is null or completed_at >= 0),
  duration_sec integer check (duration_sec is null or duration_sec >= 0),
  deleted_at bigint check (deleted_at is null or deleted_at >= 0),
  created_at bigint not null check (created_at >= 0),
  updated_at bigint not null check (updated_at >= 0),
  constraint sessions_id_owner_unique unique (id, owner_user_id),
  constraint sessions_gym_owner_fk
    foreign key (gym_id, owner_user_id)
    references app_public.gyms (id, owner_user_id)
    on delete no action
);

create index if not exists sessions_owner_user_id_idx on app_public.sessions (owner_user_id);
create index if not exists sessions_status_idx on app_public.sessions (status);
create index if not exists sessions_completed_at_idx on app_public.sessions (completed_at);
create index if not exists sessions_deleted_at_idx on app_public.sessions (deleted_at);

create table if not exists app_public.session_exercises (
  id text primary key,
  owner_user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  session_id text not null,
  order_index integer not null check (order_index >= 0),
  name text not null check (length(btrim(name)) > 0),
  machine_name text,
  origin_scope_id text not null default 'private',
  origin_source_id text not null default 'local',
  created_at bigint not null check (created_at >= 0),
  updated_at bigint not null check (updated_at >= 0),
  constraint session_exercises_id_owner_unique unique (id, owner_user_id),
  constraint session_exercises_session_owner_fk
    foreign key (session_id, owner_user_id)
    references app_public.sessions (id, owner_user_id)
    on delete cascade,
  constraint session_exercises_session_order_unique unique (session_id, order_index)
);

create index if not exists session_exercises_owner_user_id_idx on app_public.session_exercises (owner_user_id);
create index if not exists session_exercises_session_id_idx on app_public.session_exercises (session_id);

create table if not exists app_public.exercise_sets (
  id text primary key,
  owner_user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  session_exercise_id text not null,
  order_index integer not null check (order_index >= 0),
  weight_value text not null default '',
  reps_value text not null default '',
  created_at bigint not null check (created_at >= 0),
  updated_at bigint not null check (updated_at >= 0),
  constraint exercise_sets_id_owner_unique unique (id, owner_user_id),
  constraint exercise_sets_session_exercise_owner_fk
    foreign key (session_exercise_id, owner_user_id)
    references app_public.session_exercises (id, owner_user_id)
    on delete cascade,
  constraint exercise_sets_session_exercise_order_unique unique (session_exercise_id, order_index)
);

create index if not exists exercise_sets_owner_user_id_idx on app_public.exercise_sets (owner_user_id);
create index if not exists exercise_sets_session_exercise_id_idx on app_public.exercise_sets (session_exercise_id);

grant usage on schema app_public to anon, authenticated, service_role;
grant select, insert, update, delete on all tables in schema app_public to authenticated;
grant select, insert, update, delete on all tables in schema app_public to service_role;

create or replace function app_public.enforce_owner_user_id_immutable()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'UPDATE' and new.owner_user_id is distinct from old.owner_user_id then
    raise exception 'owner_user_id is immutable'
      using errcode = '23514';
  end if;
  return new;
end;
$$;

drop trigger if exists gyms_owner_user_id_immutable on app_public.gyms;
create trigger gyms_owner_user_id_immutable
before update on app_public.gyms
for each row
execute function app_public.enforce_owner_user_id_immutable();

drop trigger if exists sessions_owner_user_id_immutable on app_public.sessions;
create trigger sessions_owner_user_id_immutable
before update on app_public.sessions
for each row
execute function app_public.enforce_owner_user_id_immutable();

drop trigger if exists session_exercises_owner_user_id_immutable on app_public.session_exercises;
create trigger session_exercises_owner_user_id_immutable
before update on app_public.session_exercises
for each row
execute function app_public.enforce_owner_user_id_immutable();

drop trigger if exists exercise_sets_owner_user_id_immutable on app_public.exercise_sets;
create trigger exercise_sets_owner_user_id_immutable
before update on app_public.exercise_sets
for each row
execute function app_public.enforce_owner_user_id_immutable();

alter table app_public.gyms enable row level security;
alter table app_public.sessions enable row level security;
alter table app_public.session_exercises enable row level security;
alter table app_public.exercise_sets enable row level security;

drop policy if exists gyms_owner_select on app_public.gyms;
create policy gyms_owner_select
on app_public.gyms
for select
to authenticated
using (owner_user_id = auth.uid());

drop policy if exists gyms_owner_insert on app_public.gyms;
create policy gyms_owner_insert
on app_public.gyms
for insert
to authenticated
with check (owner_user_id = auth.uid());

drop policy if exists gyms_owner_update on app_public.gyms;
create policy gyms_owner_update
on app_public.gyms
for update
to authenticated
using (owner_user_id = auth.uid())
with check (owner_user_id = auth.uid());

drop policy if exists gyms_owner_delete on app_public.gyms;
create policy gyms_owner_delete
on app_public.gyms
for delete
to authenticated
using (owner_user_id = auth.uid());

drop policy if exists sessions_owner_select on app_public.sessions;
create policy sessions_owner_select
on app_public.sessions
for select
to authenticated
using (owner_user_id = auth.uid());

drop policy if exists sessions_owner_insert on app_public.sessions;
create policy sessions_owner_insert
on app_public.sessions
for insert
to authenticated
with check (owner_user_id = auth.uid());

drop policy if exists sessions_owner_update on app_public.sessions;
create policy sessions_owner_update
on app_public.sessions
for update
to authenticated
using (owner_user_id = auth.uid())
with check (owner_user_id = auth.uid());

drop policy if exists sessions_owner_delete on app_public.sessions;
create policy sessions_owner_delete
on app_public.sessions
for delete
to authenticated
using (owner_user_id = auth.uid());

drop policy if exists session_exercises_owner_select on app_public.session_exercises;
create policy session_exercises_owner_select
on app_public.session_exercises
for select
to authenticated
using (owner_user_id = auth.uid());

drop policy if exists session_exercises_owner_insert on app_public.session_exercises;
create policy session_exercises_owner_insert
on app_public.session_exercises
for insert
to authenticated
with check (owner_user_id = auth.uid());

drop policy if exists session_exercises_owner_update on app_public.session_exercises;
create policy session_exercises_owner_update
on app_public.session_exercises
for update
to authenticated
using (owner_user_id = auth.uid())
with check (owner_user_id = auth.uid());

drop policy if exists session_exercises_owner_delete on app_public.session_exercises;
create policy session_exercises_owner_delete
on app_public.session_exercises
for delete
to authenticated
using (owner_user_id = auth.uid());

drop policy if exists exercise_sets_owner_select on app_public.exercise_sets;
create policy exercise_sets_owner_select
on app_public.exercise_sets
for select
to authenticated
using (owner_user_id = auth.uid());

drop policy if exists exercise_sets_owner_insert on app_public.exercise_sets;
create policy exercise_sets_owner_insert
on app_public.exercise_sets
for insert
to authenticated
with check (owner_user_id = auth.uid());

drop policy if exists exercise_sets_owner_update on app_public.exercise_sets;
create policy exercise_sets_owner_update
on app_public.exercise_sets
for update
to authenticated
using (owner_user_id = auth.uid())
with check (owner_user_id = auth.uid());

drop policy if exists exercise_sets_owner_delete on app_public.exercise_sets;
create policy exercise_sets_owner_delete
on app_public.exercise_sets
for delete
to authenticated
using (owner_user_id = auth.uid());

comment on schema app_public is
  'App-owned API schema. M5 introduces user-scoped sync tables protected by RLS.';
