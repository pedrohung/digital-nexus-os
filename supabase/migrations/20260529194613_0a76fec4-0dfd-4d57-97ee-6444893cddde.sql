-- marketing_landings
CREATE TABLE public.marketing_landings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  html_content TEXT NOT NULL,
  target_offer TEXT,
  performance_score INT NOT NULL DEFAULT 100,
  conversion_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.marketing_landings TO authenticated;
GRANT ALL ON public.marketing_landings TO service_role;

ALTER TABLE public.marketing_landings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ml_all_biz" ON public.marketing_landings
  FOR ALL TO authenticated
  USING (business_id = public.current_business_id())
  WITH CHECK (business_id = public.current_business_id());

-- financial_roi_reports
CREATE TABLE public.financial_roi_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL,
  report_period TEXT NOT NULL,
  total_spend NUMERIC(12,2) NOT NULL,
  revenue_generated NUMERIC(12,2) NOT NULL,
  calculated_roas NUMERIC(6,2) NOT NULL,
  executive_summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.financial_roi_reports TO authenticated;
GRANT ALL ON public.financial_roi_reports TO service_role;

ALTER TABLE public.financial_roi_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "frr_all_biz" ON public.financial_roi_reports
  FOR ALL TO authenticated
  USING (business_id = public.current_business_id())
  WITH CHECK (business_id = public.current_business_id());