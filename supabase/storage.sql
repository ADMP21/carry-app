-- ============================================================
-- Carry — Supabase Storage Setup
-- Run AFTER schema.sql in Supabase Dashboard > SQL Editor
-- ============================================================

-- Create storage bucket for issue photos
insert into storage.buckets (id, name, public)
values ('issue-photos', 'issue-photos', true)
on conflict (id) do nothing;

-- Allow authenticated users to upload photos
create policy "Authenticated users can upload photos"
  on storage.objects for insert
  with check (
    bucket_id = 'issue-photos'
    and auth.role() = 'authenticated'
  );

-- Allow public read access to photos (since bucket is public)
create policy "Public can view photos"
  on storage.objects for select
  using (bucket_id = 'issue-photos');

-- Allow users to delete their own uploads (optional)
create policy "Users can delete own photos"
  on storage.objects for delete
  using (
    bucket_id = 'issue-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
