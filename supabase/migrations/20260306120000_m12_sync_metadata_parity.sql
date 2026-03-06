-- M12 sync metadata parity:
-- Keep server-side sync tables aligned with local/mobile session metadata fields.

alter table app_public.session_exercises
  add column if not exists exercise_definition_id text;

create index if not exists session_exercises_exercise_definition_id_idx
  on app_public.session_exercises (exercise_definition_id);

alter table app_public.exercise_sets
  add column if not exists set_type text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'exercise_sets_set_type_guard'
  ) then
    alter table app_public.exercise_sets
      add constraint exercise_sets_set_type_guard
      check (
        set_type is null
        or set_type in ('warm_up', 'rir_0', 'rir_1', 'rir_2')
      );
  end if;
end
$$;
