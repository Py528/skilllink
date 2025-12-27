-- Courses: add slug + actual aggregated duration (keep existing fields)
alter table public.courses
  add column if not exists slug text unique,
  add column if not exists duration_seconds integer;

-- Sections: remove embedded lessons array; rely on normalized lessons.section_id
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'course_sections'
      and column_name = 'lessons'
  ) then
    alter table public.course_sections drop column lessons;
  end if;
end $$;

-- Helpful ordering indexes
create index if not exists course_sections_course_order_idx
  on public.course_sections(course_id, order_index);

-- Lessons: add transcript_url and ide_project_id (FK added later after table exists)
alter table public.lessons
  add column if not exists transcript_url text,
  add column if not exists ide_project_id uuid;

-- Lessons.type: ensure it includes 'code'
alter table public.lessons
  drop constraint if exists lessons_type_check;
alter table public.lessons
  add constraint lessons_type_check
  check (type = any (array['video','text','quiz','assignment','code']));

create index if not exists lessons_course_order_idx
  on public.lessons(course_id, order_index);
create index if not exists lessons_section_order_idx
  on public.lessons(section_id, order_index);

-- Lesson resources (normalized metadata)
create table if not exists public.lesson_resources (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  name text not null,
  type text not null check (type in ('pdf','zip','code','image','other')),
  storage text not null check (storage in ('s3','supabase')),
  url text not null,
  size_bytes bigint,
  content_type text,
  checksum_sha256 text,
  is_public boolean default false,
  created_at timestamptz default now()
);
create index if not exists lesson_resources_lesson_id_idx on public.lesson_resources(lesson_id);

-- IDE projects
create table if not exists public.ide_projects (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  lesson_id uuid references public.lessons(id) on delete set null,
  name text not null,
  template text,
  entry_file text,
  package_manager text check (package_manager in ('npm','yarn','pnpm','pip','poetry')),
  env_vars_ref uuid,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists ide_projects_course_id_idx on public.ide_projects(course_id);
create index if not exists ide_projects_lesson_id_idx on public.ide_projects(lesson_id);

-- Now add the FK from lessons to ide_projects (conditionally)
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'lessons_ide_project_fk'
  ) then
    alter table public.lessons
      add constraint lessons_ide_project_fk
      foreign key (ide_project_id) references public.ide_projects(id) on delete set null;
  end if;
end $$;

-- IDE files
create table if not exists public.ide_files (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.ide_projects(id) on delete cascade,
  path text not null,
  size_bytes bigint,
  content_type text,
  storage text not null check (storage in ('supabase','s3')),
  url text not null,
  version int not null default 1,
  checksum_sha256 text,
  is_binary boolean default false,
  is_executable boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (project_id, path, version)
);
create index if not exists ide_files_project_path_idx on public.ide_files(project_id, path);
