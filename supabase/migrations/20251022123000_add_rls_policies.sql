-- Enable RLS on new tables
alter table public.lesson_resources enable row level security;
alter table public.ide_projects enable row level security;
alter table public.ide_files enable row level security;

-- lesson_resources policies
drop policy if exists lesson_resources_read_enrolled on public.lesson_resources;
create policy lesson_resources_read_enrolled
on public.lesson_resources
for select
using (
  exists (
    select 1
    from public.lessons l
    join public.courses c on c.id = l.course_id
    join public.enrollments e on e.course_id = c.id and e.user_id = auth.uid()
    where l.id = lesson_id
  )
  or exists (
    select 1
    from public.lessons l
    join public.courses c on c.id = l.course_id
    where l.id = lesson_id and c.instructor_id = auth.uid()
  )
  or is_public = true
);

drop policy if exists lesson_resources_write_instructor on public.lesson_resources;
create policy lesson_resources_write_instructor
on public.lesson_resources
for insert to authenticated
with check (
  exists (
    select 1
    from public.lessons l
    join public.courses c on c.id = l.course_id
    where l.id = lesson_id and c.instructor_id = auth.uid()
  )
);

drop policy if exists lesson_resources_update_instructor on public.lesson_resources;
create policy lesson_resources_update_instructor
on public.lesson_resources
for update to authenticated
using (
  exists (
    select 1
    from public.lessons l
    join public.courses c on c.id = l.course_id
    where l.id = lesson_id and c.instructor_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.lessons l
    join public.courses c on c.id = l.course_id
    where l.id = lesson_id and c.instructor_id = auth.uid()
  )
);

-- ide_projects policies
drop policy if exists ide_projects_read_enrolled on public.ide_projects;
create policy ide_projects_read_enrolled
on public.ide_projects
for select
using (
  exists (
    select 1 from public.courses c
    where c.id = course_id and (c.instructor_id = auth.uid() or exists (
      select 1 from public.enrollments e where e.course_id = c.id and e.user_id = auth.uid()
    ))
  )
);

drop policy if exists ide_projects_write_instructor on public.ide_projects;
create policy ide_projects_write_instructor
on public.ide_projects
for all to authenticated
using (
  exists (select 1 from public.courses c where c.id = course_id and c.instructor_id = auth.uid())
)
with check (
  exists (select 1 from public.courses c where c.id = course_id and c.instructor_id = auth.uid())
);

-- ide_files policies
drop policy if exists ide_files_read_enrolled on public.ide_files;
create policy ide_files_read_enrolled
on public.ide_files
for select
using (
  exists (
    select 1
    from public.ide_projects p
    join public.courses c on c.id = p.course_id
    where p.id = project_id and (c.instructor_id = auth.uid() or exists (
      select 1 from public.enrollments e where e.course_id = c.id and e.user_id = auth.uid()
    ))
  )
);

drop policy if exists ide_files_write_instructor on public.ide_files;
create policy ide_files_write_instructor
on public.ide_files
for all to authenticated
using (
  exists (
    select 1
    from public.ide_projects p
    join public.courses c on c.id = p.course_id
    where p.id = project_id and c.instructor_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.ide_projects p
    join public.courses c on c.id = p.course_id
    where p.id = project_id and c.instructor_id = auth.uid()
  )
);
