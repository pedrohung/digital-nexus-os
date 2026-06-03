CREATE TABLE IF NOT EXISTS public.compliance_audit_ledgers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL,
  action_type text NOT NULL,
  target_module text NOT NULL,
  compliance_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.compliance_audit_ledgers TO authenticated;
GRANT ALL ON public.compliance_audit_ledgers TO service_role;

ALTER TABLE public.compliance_audit_ledgers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cal_all_biz" ON public.compliance_audit_ledgers
  FOR ALL TO authenticated
  USING (business_id = public.current_business_id())
  WITH CHECK (business_id = public.current_business_id());

CREATE INDEX IF NOT EXISTS idx_cal_business_created ON public.compliance_audit_ledgers(business_id, created_at DESC);