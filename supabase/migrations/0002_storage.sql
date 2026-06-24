-- ───────────────────────────────────────────────────────────────────────────
--  Stockage des photos de progression (avant/après)
--  Bucket privé : chaque utilisateur n'accède qu'à son propre dossier.
--  Convention de chemin : "<user_id>/<day>/<before|after>.jpg"
-- ───────────────────────────────────────────────────────────────────────────

insert into storage.buckets (id, name, public)
values ('progress-photos', 'progress-photos', false)
on conflict (id) do nothing;

create policy "progress-photos: read own"
  on storage.objects for select
  using (
    bucket_id = 'progress-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "progress-photos: write own"
  on storage.objects for insert
  with check (
    bucket_id = 'progress-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "progress-photos: update own"
  on storage.objects for update
  using (
    bucket_id = 'progress-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
