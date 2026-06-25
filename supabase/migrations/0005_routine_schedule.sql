-- ───────────────────────────────────────────────────────────────────────────
--  0005 — Horaire de routine
--  Au lieu d'un verrou fixe de 24 h, la séance suivante se débloque à l'heure
--  locale choisie par l'utilisateur (ex. 08:00). On stocke l'heure voulue et
--  le décalage horaire local pour calculer le déblocage côté serveur.
-- ───────────────────────────────────────────────────────────────────────────

alter table public.profiles
  add column if not exists routine_time text not null default '08:00',
  add column if not exists routine_tz_offset int not null default 0;

comment on column public.profiles.routine_time is 'Heure locale voulue pour la routine, format HH:MM';
comment on column public.profiles.routine_tz_offset is 'Décalage local vs UTC en minutes (= -getTimezoneOffset())';
