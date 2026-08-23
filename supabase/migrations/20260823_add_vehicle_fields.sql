-- ==============================================================================
-- AUTO 28 SHOWROOM MANAGER — VEHICLE FIELD EXTENSIONS
-- Fields: coinvest_date (TIMESTAMPTZ / DATE), buying_commission_paid (BOOLEAN)
-- ==============================================================================

ALTER TABLE IF EXISTS public.vehicles 
  ADD COLUMN IF NOT EXISTS coinvest_date text,
  ADD COLUMN IF NOT EXISTS buying_commission_paid boolean DEFAULT false;
