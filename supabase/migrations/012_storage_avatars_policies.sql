-- Storage bucket and RLS policies for user avatars
-- Creates a public 'avatars' bucket (if missing) and policies to allow
-- authenticated users to upload/update/delete their own files and public read access.

-- Create the bucket if it doesn't exist
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Enable RLS on storage.objects (usually enabled by default)
alter table if exists storage.objects enable row level security;

-- Public read access to files in the avatars bucket
create policy if not exists "Public read access to avatars"
on storage.objects for select
using (bucket_id = 'avatars');

-- Allow authenticated users to upload to the avatars bucket
create policy if not exists "Authenticated users can upload avatars"
on storage.objects for insert
with check (
  bucket_id = 'avatars'
  and auth.role() = 'authenticated'
);

-- Allow owners to update their own files in the avatars bucket
create policy if not exists "Owners can update their avatars"
on storage.objects for update
using (
  bucket_id = 'avatars' and owner = auth.uid()
)
with check (
  bucket_id = 'avatars' and owner = auth.uid()
);

-- Allow owners to delete their own files in the avatars bucket
create policy if not exists "Owners can delete their avatars"
on storage.objects for delete
using (
  bucket_id = 'avatars' and owner = auth.uid()
);
