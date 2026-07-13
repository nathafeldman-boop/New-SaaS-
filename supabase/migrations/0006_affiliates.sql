-- ──────────────────────────────────────────────────────────────────────────
--  Programme d'affiliation : affiliés, versements, attribution sur profiles.
--  Accès uniquement via la clé service (API serveur) : RLS sans policy.
-- ──────────────────────────────────────────────────────────────────────────

create table if not exists public.affiliates (
  id uuid primary key default gen_random_uuid(),
  pseudo text not null unique,
  access_code text not null,
  rate numeric not null default 0.6,
  created_at timestamptz not null default now()
);

create table if not exists public.affiliate_payouts (
  id uuid primary key default gen_random_uuid(),
  affiliate_id uuid not null references public.affiliates(id) on delete cascade,
  amount numeric not null,
  note text,
  paid_at timestamptz not null default now()
);

-- Attribution : pseudo de l'affilié qui a amené ce compte (cookie ?ref=).
alter table public.profiles add column if not exists ref text;

alter table public.affiliates enable row level security;
alter table public.affiliate_payouts enable row level security;
