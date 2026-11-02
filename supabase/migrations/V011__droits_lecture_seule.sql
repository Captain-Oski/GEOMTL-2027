-- ============================================================
-- V011 : lecture seule pour les visiteurs non connectés
-- ============================================================
-- But        : les vues publiques de GÉOMTL et les tables géospatiales du
--              schéma public ne s'écrivent plus avec la clé publique.
-- Dépend de  : V004 (partners), V005 (exhibitors), V006 (sessions)
-- Auteur     : GéoMTL
-- Date       : 2026-11-02
-- Rollback   : voir section ROLLBACK en bas
--
-- Notes :
--   - La lecture (select) ne change pas : le site lit toujours ces vues.
--   - L'admin écrit dans les tables, pas dans les vues : il n'est pas touché.
--   - Les tables du schéma public appartiennent au projet m4p.ca, hébergé dans
--     le même projet Supabase. Une application qui y écrit doit passer par la
--     clé serveur.

-- GÉOMTL : vues publiques en lecture seule
revoke insert, update, delete, truncate, references, trigger
  on geomtl2027.public_partners_view,
     geomtl2027.public_exhibitors_view,
     geomtl2027.public_sessions_view
  from anon, authenticated;

-- m4p.ca : plus d'écriture avec la clé publique
revoke insert, update, delete, truncate, references, trigger
  on public.geo_datasets,
     public.geo_features,
     public.tile_requests,
     public.sync_log,
     public.dataset_style_presets
  from anon, authenticated;

revoke execute on function public.insert_geo_features_batch(text, jsonb)
  from public, anon, authenticated;

-- ============================================================
-- ROLLBACK
-- ============================================================
-- grant insert, update, delete, truncate, references, trigger on geomtl2027.public_partners_view, geomtl2027.public_exhibitors_view, geomtl2027.public_sessions_view to anon, authenticated;
-- grant insert, update, delete, truncate, references, trigger on public.geo_datasets, public.geo_features, public.tile_requests, public.sync_log, public.dataset_style_presets to anon, authenticated;
-- grant execute on function public.insert_geo_features_batch(text, jsonb) to public, anon, authenticated;
