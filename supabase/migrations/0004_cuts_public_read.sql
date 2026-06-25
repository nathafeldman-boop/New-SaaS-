-- ───────────────────────────────────────────────────────────────────────────
--  Le catalogue de coupes alimente des pages SEO publiques (/coupes/*).
--  On autorise donc la lecture anonyme (le catalogue n'a rien de sensible).
-- ───────────────────────────────────────────────────────────────────────────

drop policy if exists "cuts_catalog: public read" on public.cuts_catalog;
create policy "cuts_catalog: public read" on public.cuts_catalog
  for select using (true);
