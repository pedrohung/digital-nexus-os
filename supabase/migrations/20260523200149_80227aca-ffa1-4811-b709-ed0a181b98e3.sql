
-- 1. Fix search_path on trigger function
CREATE OR REPLACE FUNCTION public.trigger_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

-- 2. Revoke execute on SECURITY DEFINER helpers from API roles
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.current_business_id() FROM PUBLIC, anon;
-- authenticated still needs current_business_id() for RLS policies — keep it
GRANT EXECUTE ON FUNCTION public.current_business_id() TO authenticated;

-- 3. Tighten biz_insert: only when caller has no business yet
DROP POLICY IF EXISTS "biz_insert_own" ON public.businesses;
CREATE POLICY "biz_insert_own" ON public.businesses FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND business_id IS NULL)
  );
