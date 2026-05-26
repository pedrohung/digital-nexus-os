
CREATE TABLE IF NOT EXISTS public.local_grid_audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL,
  keyword TEXT NOT NULL,
  grid_size INT NOT NULL DEFAULT 9 CHECK (grid_size IN (9, 25)),
  average_rank NUMERIC(4,2) NOT NULL,
  competitor_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.local_grid_audits TO authenticated;
GRANT ALL ON public.local_grid_audits TO service_role;

ALTER TABLE public.local_grid_audits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "lga_all_biz" ON public.local_grid_audits
  FOR ALL TO authenticated
  USING (business_id = public.current_business_id())
  WITH CHECK (business_id = public.current_business_id());

CREATE INDEX IF NOT EXISTS idx_lga_biz_created ON public.local_grid_audits(business_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.intercepted_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL,
  customer_name TEXT NOT NULL,
  score INT NOT NULL CHECK (score >= 1 AND score <= 5),
  sentiment_score NUMERIC(3,2),
  feedback_text TEXT,
  status TEXT NOT NULL DEFAULT 'quarantine' CHECK (status IN ('quarantine', 'resolved', 'escalated')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.intercepted_reviews TO authenticated;
GRANT ALL ON public.intercepted_reviews TO service_role;

ALTER TABLE public.intercepted_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ir_all_biz" ON public.intercepted_reviews
  FOR ALL TO authenticated
  USING (business_id = public.current_business_id())
  WITH CHECK (business_id = public.current_business_id());

CREATE INDEX IF NOT EXISTS idx_ir_biz_created ON public.intercepted_reviews(business_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.budget_swarm_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL,
  total_budget_reallocated NUMERIC(12,2) NOT NULL,
  efficiency_gain_percent NUMERIC(5,2) NOT NULL,
  log_details JSONB NOT NULL DEFAULT '{}'::jsonb,
  executed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.budget_swarm_executions TO authenticated;
GRANT ALL ON public.budget_swarm_executions TO service_role;

ALTER TABLE public.budget_swarm_executions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "bse_all_biz" ON public.budget_swarm_executions
  FOR ALL TO authenticated
  USING (business_id = public.current_business_id())
  WITH CHECK (business_id = public.current_business_id());

CREATE INDEX IF NOT EXISTS idx_bse_biz_executed ON public.budget_swarm_executions(business_id, executed_at DESC);
