-- ============================================================
-- CONFIGURATION COMPLÈTE de la base « Ascensions » (carnet de sommets)
-- À exécuter UNE FOIS dans Supabase Dashboard > SQL Editor.
-- 100% idempotent : sans danger même si des tables existent déjà.
-- ============================================================

-- ---------- TABLES ----------

create table if not exists hikes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  region text default '',
  elevation_m int default 0,        -- altitude du sommet (mètres)
  gain_m int default 0,             -- dénivelé positif (mètres)
  distance_km numeric default 0,    -- distance aller-retour (km)
  difficulty text default 'modere', -- facile | modere | difficile | expert
  status text default 'a_essayer',  -- a_essayer | planifie | fait
  location text default '',
  lat numeric,
  lng numeric,
  duration text default '',         -- ex "6-8h"
  date_done date,
  rating int default 0,             -- note perso 0-5
  notes text default '',
  cover_url text default '',
  adk46 boolean default false,      -- fait partie des 46 High Peaks
  adk_rank int,                     -- rang officiel 1..46 (tri)
  created_at timestamptz default now()
);
-- garanties au cas où la table existait déjà sans ces colonnes
alter table hikes add column if not exists adk46 boolean default false;
alter table hikes add column if not exists adk_rank int;
alter table hikes add column if not exists cover_url text default '';

create table if not exists hike_photos (
  id uuid primary key default gen_random_uuid(),
  hike_id uuid not null references hikes(id) on delete cascade,
  url text not null,
  file_path text default '',
  caption text default '',
  created_at timestamptz default now()
);

create table if not exists goals (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  target int default 0,
  progress int default 0,
  region text default '',
  created_at timestamptz default now()
);

-- ---------- RLS + POLICIES (accès via la clé anon — app perso à 2) ----------

do $$
declare t text;
begin
  foreach t in array array['hikes','hike_photos','goals']
  loop
    execute format('alter table %I enable row level security', t);
    execute format('drop policy if exists "anon all %1$s" on %1$I', t);
    execute format('create policy "anon all %1$s" on %1$I for all to anon using (true) with check (true)', t);
  end loop;
end $$;

-- ---------- STORAGE (bucket « hike-photos » pour les photos perso) ----------

insert into storage.buckets (id, name, public)
values ('hike-photos', 'hike-photos', true)
on conflict (id) do update set public = true;

drop policy if exists "anon all hike-photos storage" on storage.objects;
create policy "anon all hike-photos storage" on storage.objects
  for all to anon using (bucket_id = 'hike-photos') with check (bucket_id = 'hike-photos');

-- ---------- SEED : les 46 High Peaks des Adirondacks ----------
-- Altitudes officielles (pieds) converties en mètres. status = 'a_essayer'.
-- Idempotent : n'insère un sommet que s'il n'existe pas déjà (par nom + adk46).

insert into hikes (name, region, elevation_m, difficulty, status, adk46, adk_rank)
select v.name, 'Adirondacks', v.elev_m, 'difficile', 'a_essayer', true, v.rank
from (values
  (1,  'Mount Marcy',          1629),
  (2,  'Algonquin Peak',       1559),
  (3,  'Mount Haystack',       1512),
  (4,  'Mount Skylight',       1501),
  (5,  'Whiteface Mountain',   1483),
  (6,  'Dix Mountain',         1480),
  (7,  'Gray Peak',            1475),
  (8,  'Iroquois Peak',        1475),
  (9,  'Basin Mountain',       1471),
  (10, 'Gothics',              1444),
  (11, 'Mount Colden',         1437),
  (12, 'Giant Mountain',       1410),
  (13, 'Nippletop',            1408),
  (14, 'Santanoni Peak',       1404),
  (15, 'Mount Redfield',       1404),
  (16, 'Wright Peak',          1396),
  (17, 'Saddleback Mountain',  1376),
  (18, 'Panther Peak',         1354),
  (19, 'Tabletop Mountain',    1349),
  (20, 'Rocky Peak Ridge',     1347),
  (21, 'Macomb Mountain',      1343),
  (22, 'Armstrong Mountain',   1341),
  (23, 'Hough Peak',           1341),
  (24, 'Seward Mountain',      1329),
  (25, 'Mount Marshall',       1329),
  (26, 'Allen Mountain',       1323),
  (27, 'Big Slide Mountain',   1292),
  (28, 'Esther Mountain',      1292),
  (29, 'Upper Wolfjaw Mountain', 1276),
  (30, 'Lower Wolfjaw Mountain', 1273),
  (31, 'Street Mountain',      1270),
  (32, 'Phelps Mountain',      1268),
  (33, 'Mount Donaldson',      1262),
  (34, 'Seymour Mountain',     1256),
  (35, 'Sawteeth',             1250),
  (36, 'Cascade Mountain',     1249),
  (37, 'South Dix',            1237),
  (38, 'Porter Mountain',      1237),
  (39, 'Mount Colvin',         1236),
  (40, 'Mount Emmons',         1231),
  (41, 'Dial Mountain',        1225),
  (42, 'Grace Peak',           1223),
  (43, 'Blake Peak',           1207),
  (44, 'Cliff Mountain',       1207),
  (45, 'Nye Mountain',         1187),
  (46, 'Couchsachraga Peak',   1164)
) as v(rank, name, elev_m)
where not exists (
  select 1 from hikes h where h.adk46 = true and h.name = v.name
);
