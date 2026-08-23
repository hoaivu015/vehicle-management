-- Migration: Enable Realtime Replication for Auto 28 Core Tables
-- Date: 2026-08-23
-- Purpose: Ensures postgres_changes events are broadcasted to all connected clients in real-time.

-- Set replica identity to FULL so UPDATE/DELETE events provide complete records
ALTER TABLE IF EXISTS public.vehicles REPLICA IDENTITY FULL;
ALTER TABLE IF EXISTS public.employees REPLICA IDENTITY FULL;
ALTER TABLE IF EXISTS public.operating_expenses REPLICA IDENTITY FULL;
ALTER TABLE IF EXISTS public.company_settings REPLICA IDENTITY FULL;
ALTER TABLE IF EXISTS public.role_permissions REPLICA IDENTITY FULL;

-- Safely add tables to supabase_realtime publication if not already present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'vehicles'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.vehicles;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'employees'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.employees;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'operating_expenses'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.operating_expenses;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'company_settings'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.company_settings;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'role_permissions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.role_permissions;
  END IF;
END $$;
