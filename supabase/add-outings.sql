-- ============================================================
-- MIGRATION : section « Sorties » (planification simple)
-- À exécuter UNE FOIS dans Supabase Dashboard > SQL Editor.
-- Idempotent : sans danger si déjà exécuté.
-- ============================================================

create table if not exists outings (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  destinations text[] default '{}',   -- une ou plusieurs destinations (noms libres)
  notes text default '',
  done boolean default false,
  created_at timestamptz default now()
);

alter table outings enable row level security;
drop policy if exists "anon all outings" on outings;
create policy "anon all outings" on outings for all to anon using (true) with check (true);
