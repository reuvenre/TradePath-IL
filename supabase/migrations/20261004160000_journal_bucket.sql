-- Private storage for learner screenshots (docs/05-DATA-MODEL.md): bucket `journal`, one folder per user.
-- Paths: <user_id>/<trade_id>.png for journal trades, <user_id>/gates/s<stage>/<file> for gate evidence.
-- Each learner may read and write only inside the folder named after their own user id.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('journal', 'journal', false, 5242880, array['image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do nothing;

create policy "journal_select_own" on storage.objects
  for select to authenticated
  using (bucket_id = 'journal' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "journal_insert_own" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'journal' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "journal_update_own" on storage.objects
  for update to authenticated
  using (bucket_id = 'journal' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'journal' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "journal_delete_own" on storage.objects
  for delete to authenticated
  using (bucket_id = 'journal' and (storage.foldername(name))[1] = (select auth.uid())::text);
