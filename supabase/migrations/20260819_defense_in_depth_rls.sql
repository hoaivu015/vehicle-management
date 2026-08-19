-- ==============================================================================
-- AUTO 28 SHOWROOM MANAGER — DEFENSE-IN-DEPTH ROW-LEVEL SECURITY (RLS) POLICIES
-- Tiêu chuẩn: ISO/IEC 27001:2022 • OWASP ASVS Level 2 • Zero Trust (NIST SP 800-207)
-- Ngày cập nhật: 2026-08-19
-- ==============================================================================

-- 1. KÍCH HOẠT ROW LEVEL SECURITY (RLS) TRÊN TOÀN BỘ CÁC BẢNG HIỆN HỮU
ALTER TABLE IF EXISTS public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.operating_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.salary_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.landingpage_config ENABLE ROW LEVEL SECURITY;

-- 2. HÀM TIỆN ÍCH KIỂM TRA QUYỀN HẠN TỪ JWT SESSION
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS text AS $$
  SELECT role FROM public.employees WHERE email = auth.jwt() ->> 'email' LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.employees 
    WHERE email = auth.jwt() ->> 'email' AND role = 'ADMIN'
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_admin_or_accountant()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.employees 
    WHERE email = auth.jwt() ->> 'email' AND role IN ('ADMIN', 'ACCOUNTANT')
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ==============================================================================
-- 3. CHÍNH SÁCH BẢO VỆ BẢNG KHO XE (vehicles)
-- ==============================================================================
DROP POLICY IF EXISTS "Allow authenticated staff to read vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Allow admin and accountant to modify vehicles" ON public.vehicles;

CREATE POLICY "Allow authenticated staff to read vehicles"
ON public.vehicles FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow admin and accountant to modify vehicles"
ON public.vehicles FOR ALL
TO authenticated
USING (public.is_admin_or_accountant())
WITH CHECK (public.is_admin_or_accountant());

-- ==============================================================================
-- 4. CHÍNH SÁCH BẢO VỆ BẢNG NHÂN VIÊN & NGƯỜI DÙNG (employees & users)
-- ==============================================================================
DROP POLICY IF EXISTS "Allow authenticated staff to view employee list" ON public.employees;
DROP POLICY IF EXISTS "Allow staff to update own profile or admin update all" ON public.employees;
DROP POLICY IF EXISTS "Allow only admin to insert employees" ON public.employees;
DROP POLICY IF EXISTS "Allow only admin to delete employees" ON public.employees;

CREATE POLICY "Allow authenticated staff to view employee list"
ON public.employees FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow staff to update own profile or admin update all"
ON public.employees FOR UPDATE
TO authenticated
USING (email = (auth.jwt() ->> 'email') OR public.is_admin())
WITH CHECK (email = (auth.jwt() ->> 'email') OR public.is_admin());

CREATE POLICY "Allow only admin to insert employees"
ON public.employees FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

CREATE POLICY "Allow only admin to delete employees"
ON public.employees FOR DELETE
TO authenticated
USING (public.is_admin());

-- Users Table
DROP POLICY IF EXISTS "Allow authenticated to read users" ON public.users;
DROP POLICY IF EXISTS "Allow admin to manage users" ON public.users;

CREATE POLICY "Allow authenticated to read users"
ON public.users FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow admin to manage users"
ON public.users FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ==============================================================================
-- 5. CHÍNH SÁCH BẢO VỆ MA TRẬN PHÂN QUYỀN (role_permissions)
-- ==============================================================================
DROP POLICY IF EXISTS "Allow authenticated to read role_permissions" ON public.role_permissions;
DROP POLICY IF EXISTS "Allow only admin to modify role_permissions" ON public.role_permissions;

CREATE POLICY "Allow authenticated to read role_permissions"
ON public.role_permissions FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow only admin to modify role_permissions"
ON public.role_permissions FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ==============================================================================
-- 6. CHÍNH SÁCH BẢO VỆ CHI PHÍ & LƯƠNG (operating_expenses & salary_payouts)
-- ==============================================================================
DROP POLICY IF EXISTS "Allow admin and accountant to manage operating expenses" ON public.operating_expenses;
DROP POLICY IF EXISTS "Allow admin and accountant to manage salary payouts" ON public.salary_payouts;

CREATE POLICY "Allow admin and accountant to manage operating expenses"
ON public.operating_expenses FOR ALL
TO authenticated
USING (public.is_admin_or_accountant())
WITH CHECK (public.is_admin_or_accountant());

CREATE POLICY "Allow admin and accountant to manage salary payouts"
ON public.salary_payouts FOR ALL
TO authenticated
USING (public.is_admin_or_accountant())
WITH CHECK (public.is_admin_or_accountant());

-- ==============================================================================
-- 7. CHÍNH SÁCH CẤU HÌNH DOANH NGHIỆP & LANDING PAGE
-- ==============================================================================
DROP POLICY IF EXISTS "Allow authenticated to read company settings" ON public.company_settings;
DROP POLICY IF EXISTS "Allow admin to manage company settings" ON public.company_settings;

CREATE POLICY "Allow authenticated to read company settings"
ON public.company_settings FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow admin to manage company settings"
ON public.company_settings FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Allow public to read landingpage config" ON public.landingpage_config;
DROP POLICY IF EXISTS "Allow admin to manage landingpage config" ON public.landingpage_config;

CREATE POLICY "Allow public to read landingpage config"
ON public.landingpage_config FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Allow admin to manage landingpage config"
ON public.landingpage_config FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());
