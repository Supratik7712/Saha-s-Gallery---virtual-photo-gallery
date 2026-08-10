create type public.app_role as enum ('admin', 'user');

create table public.user_roles (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade not null,
    role public.app_role not null,
    unique (user_id, role)
);

grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;

alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  )
$$;

create policy "Users can read own roles"
on public.user_roles
for select
to authenticated
using (auth.uid() = user_id);

create table public.media_items (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    caption text,
    location text,
    taken_year integer,
    media_type text not null default 'photo' check (media_type in ('photo', 'video')),
    file_path text not null,
    mime_type text,
    width integer,
    height integer,
    sort_order integer not null default 0,
    created_at timestamptz not null default now()
);

grant select on public.media_items to anon;
grant select, insert, update, delete on public.media_items to authenticated;
grant all on public.media_items to service_role;

alter table public.media_items enable row level security;

create policy "Anyone can view media items"
on public.media_items
for select
to anon, authenticated
using (true);

create policy "Admins can insert media items"
on public.media_items
for insert
to authenticated
with check (public.has_role(auth.uid(), 'admin'));

create policy "Admins can update media items"
on public.media_items
for update
to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

create policy "Admins can delete media items"
on public.media_items
for delete
to authenticated
using (public.has_role(auth.uid(), 'admin'));

create policy "Public can view gallery files"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'gallery');

create policy "Admins can upload gallery files"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'gallery' and public.has_role(auth.uid(), 'admin'));

create policy "Admins can update gallery files"
on storage.objects
for update
to authenticated
using (bucket_id = 'gallery' and public.has_role(auth.uid(), 'admin'));

create policy "Admins can delete gallery files"
on storage.objects
for delete
to authenticated
using (bucket_id = 'gallery' and public.has_role(auth.uid(), 'admin'));