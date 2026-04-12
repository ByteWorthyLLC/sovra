-- ============================================================
-- Phase 6 Migration: super-admin flag on users
-- ============================================================

ALTER TABLE users ADD COLUMN is_platform_admin boolean NOT NULL DEFAULT false;
