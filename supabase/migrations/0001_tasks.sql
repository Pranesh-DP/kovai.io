create type public.task_status as enum ('planned', 'in_progress', 'complete');

create table public.tasks (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title             text not null check (char_length(btrim(title)) between 1 and 120),
  notes             text check (char_length(notes) <= 1000),
  status            public.task_status not null default 'planned',
  status_changed_at timestamptz not null default now(),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index tasks_user_status_idx on public.tasks (user_id, status);
create index tasks_user_created_idx on public.tasks (user_id, created_at desc);

create or replace function public.touch_task() returns trigger
language plpgsql set search_path = public as $$
begin
  new.updated_at = now();
  if new.status is distinct from old.status then
    new.status_changed_at = now();
  end if;
  return new;
end $$;

create trigger tasks_touch before update on public.tasks
  for each row execute function public.touch_task();

alter table public.tasks enable row level security;

create policy "own tasks: select" on public.tasks for select using (user_id = auth.uid());
create policy "own tasks: insert" on public.tasks for insert with check (user_id = auth.uid());
create policy "own tasks: update" on public.tasks for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own tasks: delete" on public.tasks for delete using (user_id = auth.uid());

