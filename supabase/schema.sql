-- TaskFlow schema. Run once in the Supabase SQL editor.
-- Every table is scoped to auth.uid() via Row Level Security: a user can only ever
-- see or change their own rows. There is no "trust the client" path anywhere here —
-- every policy re-checks auth.uid() = owning user_id at the database level.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- profiles: one row per auth user, created automatically on signup
-- ---------------------------------------------------------------------------
create table if not exists profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  full_name   text,
  avatar_url  text,
  theme       text not null default 'system' check (theme in ('light','dark','system')),
  created_at  timestamptz not null default now()
);
alter table profiles enable row level security;

create policy "profiles_select_own" on profiles for select using (auth.uid() = id);
create policy "profiles_update_own" on profiles for update using (auth.uid() = id);

-- Auto-create a profile row whenever someone signs up (email/password or Google).
create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url')
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function handle_new_user();

-- ---------------------------------------------------------------------------
-- projects
-- ---------------------------------------------------------------------------
create table if not exists projects (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  color       text not null default '#6366f1',
  icon        text not null default 'folder',
  description text,
  archived    boolean not null default false,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
alter table projects enable row level security;
create index if not exists projects_user_idx on projects(user_id);

create policy "projects_all_own" on projects for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- tags
-- ---------------------------------------------------------------------------
create table if not exists tags (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  name       text not null,
  color      text not null default '#64748b',
  created_at timestamptz not null default now(),
  unique (user_id, name)
);
alter table tags enable row level security;
create index if not exists tags_user_idx on tags(user_id);

create policy "tags_all_own" on tags for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- tasks
-- ---------------------------------------------------------------------------
create table if not exists tasks (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  project_id    uuid references projects(id) on delete set null,
  parent_id     uuid references tasks(id) on delete cascade, -- non-null => this row is a subtask
  title         text not null,
  description   text,
  completed     boolean not null default false,
  completed_at  timestamptz,
  priority      text not null default 'none' check (priority in ('none','low','medium','high')),
  due_date      date,
  due_time      time,
  recurrence    text check (recurrence in (null,'daily','weekly','monthly','custom')),
  recurrence_days smallint[], -- for weekly/custom: 0=Sun .. 6=Sat
  sort_order    integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
alter table tasks enable row level security;
create index if not exists tasks_user_idx on tasks(user_id);
create index if not exists tasks_project_idx on tasks(project_id);
create index if not exists tasks_parent_idx on tasks(parent_id);
create index if not exists tasks_due_idx on tasks(user_id, due_date) where not completed;

create policy "tasks_all_own" on tasks for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- task <-> tag (many-to-many)
create table if not exists task_tags (
  task_id uuid not null references tasks(id) on delete cascade,
  tag_id  uuid not null references tags(id) on delete cascade,
  primary key (task_id, tag_id)
);
alter table task_tags enable row level security;

-- A task_tags row has no user_id of its own, so its policy checks ownership via the parent task.
create policy "task_tags_all_own" on task_tags for all
  using (exists (select 1 from tasks t where t.id = task_id and t.user_id = auth.uid()))
  with check (exists (select 1 from tasks t where t.id = task_id and t.user_id = auth.uid()));

-- keep updated_at current
create or replace function set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

drop trigger if exists tasks_set_updated_at on tasks;
create trigger tasks_set_updated_at before update on tasks for each row execute function set_updated_at();
drop trigger if exists projects_set_updated_at on projects;
create trigger projects_set_updated_at before update on projects for each row execute function set_updated_at();
