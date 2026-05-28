
CREATE TABLE public.competitor_shadow_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL,
  competitor_name TEXT NOT NULL,
  tracked_url TEXT,
  detected_change_type TEXT NOT NULL CHECK (detected_change_type IN ('pricing','keywords','backlink','offer')),
  severity_level TEXT NOT NULL CHECK (severity_level IN ('low','medium','high')),
  log_details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.competitor_shadow_logs TO authenticated;
GRANT ALL ON public.competitor_shadow_logs TO service_role;
ALTER TABLE public.competitor_shadow_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY csl_all_biz ON public.competitor_shadow_logs FOR ALL TO authenticated
  USING (business_id = public.current_business_id())
  WITH CHECK (business_id = public.current_business_id());

CREATE TABLE public.content_streams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL,
  campaign_core_topic TEXT NOT NULL,
  generated_assets JSONB NOT NULL DEFAULT '{}'::jsonb,
  distribution_status TEXT NOT NULL DEFAULT 'draft' CHECK (distribution_status IN ('draft','scheduled','published')),
  scheduled_for TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.content_streams TO authenticated;
GRANT ALL ON public.content_streams TO service_role;
ALTER TABLE public.content_streams ENABLE ROW LEVEL SECURITY;
CREATE POLICY cs_all_biz ON public.content_streams FOR ALL TO authenticated
  USING (business_id = public.current_business_id())
  WITH CHECK (business_id = public.current_business_id());

CREATE TABLE public.customer_ltv_retention (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL,
  customer_identifier TEXT NOT NULL,
  calculated_ltv NUMERIC(12,2) NOT NULL,
  churn_risk_percent NUMERIC(5,2) NOT NULL CHECK (churn_risk_percent >= 0 AND churn_risk_percent <= 100),
  next_best_action TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (business_id, customer_identifier)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.customer_ltv_retention TO authenticated;
GRANT ALL ON public.customer_ltv_retention TO service_role;
ALTER TABLE public.customer_ltv_retention ENABLE ROW LEVEL SECURITY;
CREATE POLICY clr_all_biz ON public.customer_ltv_retention FOR ALL TO authenticated
  USING (business_id = public.current_business_id())
  WITH CHECK (business_id = public.current_business_id());

CREATE TRIGGER clr_set_updated_at BEFORE UPDATE ON public.customer_ltv_retention
  FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();
