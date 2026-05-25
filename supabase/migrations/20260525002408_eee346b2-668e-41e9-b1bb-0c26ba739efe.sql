
-- Projections
CREATE TABLE public.projections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL,
  from_channel TEXT NOT NULL,
  to_channel TEXT NOT NULL,
  budget_amount NUMERIC(12,2) NOT NULL CHECK (budget_amount > 0),
  projected_roas NUMERIC(6,2) NOT NULL CHECK (projected_roas >= 0),
  confidence NUMERIC(5,2) NOT NULL CHECK (confidence >= 0 AND confidence <= 100),
  risk_level TEXT NOT NULL CHECK (risk_level IN ('low','medium','high')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','executed','rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.projections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "proj_all_biz" ON public.projections FOR ALL TO authenticated
  USING (business_id = public.current_business_id())
  WITH CHECK (business_id = public.current_business_id());
CREATE INDEX idx_projections_biz ON public.projections(business_id, created_at DESC);

-- ROI Receipts
CREATE TABLE public.roi_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL,
  projection_id UUID REFERENCES public.projections(id) ON DELETE CASCADE,
  estimated_impact NUMERIC(14,2) NOT NULL,
  actual_impact NUMERIC(14,2),
  delta_percent NUMERIC(6,2),
  status TEXT NOT NULL DEFAULT 'estimated' CHECK (status IN ('estimated','executed','confirmed','adjusted')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.roi_receipts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "roi_all_biz" ON public.roi_receipts FOR ALL TO authenticated
  USING (business_id = public.current_business_id())
  WITH CHECK (business_id = public.current_business_id());
CREATE TRIGGER roi_set_updated_at BEFORE UPDATE ON public.roi_receipts
  FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();

-- Agency configs
CREATE TABLE public.agency_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_business_id UUID NOT NULL UNIQUE,
  white_label_enabled BOOLEAN NOT NULL DEFAULT false,
  custom_domain TEXT,
  logo_url TEXT,
  primary_color TEXT NOT NULL DEFAULT '#3B82F6',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.agency_configs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "agency_cfg_all_biz" ON public.agency_configs FOR ALL TO authenticated
  USING (agency_business_id = public.current_business_id())
  WITH CHECK (agency_business_id = public.current_business_id());
CREATE TRIGGER agency_set_updated_at BEFORE UPDATE ON public.agency_configs
  FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();

-- Client mappings
CREATE TABLE public.client_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_business_id UUID NOT NULL,
  client_business_id UUID NOT NULL UNIQUE,
  client_label TEXT,
  billing_split NUMERIC(5,2) NOT NULL DEFAULT 70.00 CHECK (billing_split >= 0 AND billing_split <= 100),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','suspended')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.client_mappings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "client_map_all_biz" ON public.client_mappings FOR ALL TO authenticated
  USING (agency_business_id = public.current_business_id())
  WITH CHECK (agency_business_id = public.current_business_id());
CREATE INDEX idx_client_mappings_agency ON public.client_mappings(agency_business_id);
