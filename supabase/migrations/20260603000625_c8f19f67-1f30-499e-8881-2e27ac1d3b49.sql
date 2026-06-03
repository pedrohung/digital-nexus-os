-- Helper: check if current user has admin/owner role in their business
CREATE OR REPLACE FUNCTION public.is_business_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role IN ('admin', 'owner')
  );
$$;

REVOKE EXECUTE ON FUNCTION public.is_business_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_business_admin() TO authenticated;

-- 1. Lock down integrations to admin/owner roles only
DROP POLICY IF EXISTS int_all_biz ON public.integrations;

CREATE POLICY int_admin_biz ON public.integrations
  FOR ALL TO authenticated
  USING (business_id = public.current_business_id() AND public.is_business_admin())
  WITH CHECK (business_id = public.current_business_id() AND public.is_business_admin());

-- 2. Lock down client_mappings so only agency admins can create/modify mappings
DROP POLICY IF EXISTS client_map_all_biz ON public.client_mappings;

CREATE POLICY client_map_select_biz ON public.client_mappings
  FOR SELECT TO authenticated
  USING (agency_business_id = public.current_business_id());

CREATE POLICY client_map_write_admin ON public.client_mappings
  FOR INSERT TO authenticated
  WITH CHECK (agency_business_id = public.current_business_id() AND public.is_business_admin());

CREATE POLICY client_map_update_admin ON public.client_mappings
  FOR UPDATE TO authenticated
  USING (agency_business_id = public.current_business_id() AND public.is_business_admin())
  WITH CHECK (agency_business_id = public.current_business_id() AND public.is_business_admin());

CREATE POLICY client_map_delete_admin ON public.client_mappings
  FOR DELETE TO authenticated
  USING (agency_business_id = public.current_business_id() AND public.is_business_admin());

-- 3. Revoke EXECUTE on internal trigger functions from signed-in users.
-- These are invoked by triggers (run as table owner), so callers don't need EXECUTE.
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.trigger_set_updated_at() FROM PUBLIC, anon, authenticated;