-- ───────────────────────────────────────────────────────────────────────────
--  Cache des recommandations de produits (vraies marques via Mistral + Pexels)
--  Le rapport de score (radar) est stocké dans profiles.diagnosis.scores.
-- ───────────────────────────────────────────────────────────────────────────

alter table public.profiles
  add column if not exists product_recos jsonb;
