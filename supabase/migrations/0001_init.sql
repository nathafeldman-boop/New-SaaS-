-- ───────────────────────────────────────────────────────────────────────────
--  Capilytix — schéma initial
--  Programme capillaire quotidien suivi + abonnement Stripe (MRR)
-- ───────────────────────────────────────────────────────────────────────────

-- 1) PROFILS ──────────────────────────────────────────────────────────────────
-- Une ligne par utilisateur (lié à auth.users). Porte l'état du programme.
create table if not exists public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  email         text,
  current_day   int  not null default 0,        -- jour du programme débloqué (0 = pas commencé)
  hair_score    numeric,                          -- score capillaire courant
  diagnosis     jsonb,                            -- diagnostic initial (Mistral)
  quiz_answers  jsonb,                            -- réponses aux 10 questions
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- 2) ABONNEMENTS ─────────────────────────────────────────────────────────────
-- Mis à jour par le webhook Stripe. C'est ce qui décide de l'accès.
create table if not exists public.subscriptions (
  user_id                uuid primary key references auth.users (id) on delete cascade,
  stripe_customer_id     text,
  stripe_subscription_id text,
  status                 text,                    -- active | trialing | past_due | canceled …
  price_id               text,
  current_period_end     timestamptz,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);
create index if not exists subscriptions_customer_idx on public.subscriptions (stripe_customer_id);

-- 3) ENTRÉES QUOTIDIENNES ────────────────────────────────────────────────────
-- Une ligne par jour et par utilisateur : photo avant, photo après, routine, score.
create table if not exists public.daily_entries (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references auth.users (id) on delete cascade,
  day_number         int  not null,
  entry_date         date not null default current_date,
  photo_before_path  text,                        -- chemin dans le bucket "progress-photos"
  photo_after_path   text,
  score              numeric,
  routine            jsonb,                       -- routine générée pour ce jour
  completed          boolean not null default false,
  created_at         timestamptz not null default now(),
  unique (user_id, day_number)
);
create index if not exists daily_entries_user_idx on public.daily_entries (user_id);

-- 4) CATALOGUE DE COUPES ─────────────────────────────────────────────────────
-- Alimenté par l'admin. Lisible par tous les utilisateurs connectés.
create table if not exists public.cuts_catalog (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  image_path  text,
  tags        text[],
  gender      text,
  created_at  timestamptz not null default now()
);

-- ── Row Level Security ───────────────────────────────────────────────────────
alter table public.profiles      enable row level security;
alter table public.subscriptions enable row level security;
alter table public.daily_entries enable row level security;
alter table public.cuts_catalog  enable row level security;

-- Chacun ne voit/modifie QUE ses propres données.
create policy "profiles: self" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

-- Abonnement : lecture seule pour l'utilisateur (l'écriture passe par le service_role).
create policy "subscriptions: read own" on public.subscriptions
  for select using (auth.uid() = user_id);

create policy "daily_entries: self" on public.daily_entries
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Catalogue : lisible par tout utilisateur connecté.
create policy "cuts_catalog: read" on public.cuts_catalog
  for select using (auth.role() = 'authenticated');

-- ── Création auto du profil à l'inscription ──────────────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
