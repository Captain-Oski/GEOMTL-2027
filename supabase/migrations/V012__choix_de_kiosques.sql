-- ============================================================
-- V012 : trois choix de kiosque par demande
-- ============================================================
-- But        : une demande peut indiquer un 2e et un 3e choix de kiosque, pour
--              éviter les allers-retours quand le premier est réservé entre-temps.
-- Dépend de  : V007 (kiosques, demandes_kiosques)
-- Auteur     : GéoMTL
-- Date       : 2026-11-02
-- Rollback   : voir section ROLLBACK en bas
--
-- Notes :
--   - kiosque_numero reste le 1er choix : les demandes existantes ne changent pas.
--   - Colonnes facultatives ; un choix ne peut pas se répéter ni sauter un rang.
--   - Une demande ne change toujours pas l'état public d'un kiosque.

alter table geomtl2027.demandes_kiosques
  add column if not exists kiosque_choix_2 integer references geomtl2027.kiosques(numero),
  add column if not exists kiosque_choix_3 integer references geomtl2027.kiosques(numero);

alter table geomtl2027.demandes_kiosques
  drop constraint if exists demandes_kiosques_choix_coherents;

alter table geomtl2027.demandes_kiosques
  add constraint demandes_kiosques_choix_coherents check (
    (kiosque_choix_2 is null or (kiosque_numero is not null and kiosque_choix_2 <> kiosque_numero))
    and (kiosque_choix_3 is null or (kiosque_choix_2 is not null and kiosque_choix_3 <> kiosque_numero and kiosque_choix_3 <> kiosque_choix_2))
  );

-- ============================================================
-- ROLLBACK
-- ============================================================
-- alter table geomtl2027.demandes_kiosques drop constraint if exists demandes_kiosques_choix_coherents;
-- alter table geomtl2027.demandes_kiosques drop column if exists kiosque_choix_2, drop column if exists kiosque_choix_3;
