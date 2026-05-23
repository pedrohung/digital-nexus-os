
-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ===== Tables =====
CREATE TABLE public.businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  industry TEXT,
  timezone TEXT NOT NULL DEFAULT 'UTC',
  revenue_goal NUMERIC(14,2),
  primary_channel TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id UUID REFERENCES public.businesses(id) ON DELETE SET NULL,
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('owner','admin','editor','viewer','agency')),
  full_name TEXT,
  avatar_url TEXT,
  onboarded BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('google_ads','meta','tiktok','shopify','hubspot','stripe','google_analytics','search_console')),
  access_token TEXT,
  refresh_token TEXT,
  scopes TEXT[],
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','active','error')),
  last_sync TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  source TEXT NOT NULL,
  metric_key TEXT NOT NULL,
  metric_value NUMERIC(14,2),
  date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  author TEXT,
  rating INT CHECK (rating BETWEEN 1 AND 5),
  content TEXT,
  sentiment TEXT CHECK (sentiment IN ('positive','neutral','negative')),
  responded BOOLEAN NOT NULL DEFAULT FALSE,
  response_content TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.ai_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  payload JSONB,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','executed','denied')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===== Indexes =====
CREATE INDEX idx_metrics_biz_date ON public.metrics(business_id, date DESC);
CREATE INDEX idx_reviews_biz_sentiment ON public.reviews(business_id, sentiment);
CREATE INDEX idx_integrations_biz_provider ON public.integrations(business_id, provider);
CREATE INDEX idx_ai_logs_biz_created ON public.ai_logs(business_id, created_at DESC);

-- ===== updated_at trigger =====
CREATE OR REPLACE FUNCTION public.trigger_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

CREATE TRIGGER updated_at_businesses BEFORE UPDATE ON public.businesses
  FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();
CREATE TRIGGER updated_at_profiles BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();
CREATE TRIGGER updated_at_integrations BEFORE UPDATE ON public.integrations
  FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();

-- ===== Auto-create profile on signup =====
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ===== Helper: current user's business_id (SECURITY DEFINER avoids RLS recursion) =====
CREATE OR REPLACE FUNCTION public.current_business_id()
RETURNS UUID LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT business_id FROM public.profiles WHERE id = auth.uid();
$$;

-- ===== RLS =====
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_logs ENABLE ROW LEVEL SECURITY;

-- businesses
CREATE POLICY "biz_select_own" ON public.businesses FOR SELECT TO authenticated
  USING (id = public.current_business_id());
CREATE POLICY "biz_insert_own" ON public.businesses FOR INSERT TO authenticated
  WITH CHECK (TRUE);
CREATE POLICY "biz_update_own" ON public.businesses FOR UPDATE TO authenticated
  USING (id = public.current_business_id());

-- profiles
CREATE POLICY "profile_select_own" ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid());
CREATE POLICY "profile_update_own" ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid());
CREATE POLICY "profile_insert_own" ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());

-- integrations
CREATE POLICY "int_all_biz" ON public.integrations FOR ALL TO authenticated
  USING (business_id = public.current_business_id())
  WITH CHECK (business_id = public.current_business_id());

-- metrics
CREATE POLICY "met_all_biz" ON public.metrics FOR ALL TO authenticated
  USING (business_id = public.current_business_id())
  WITH CHECK (business_id = public.current_business_id());

-- reviews
CREATE POLICY "rev_all_biz" ON public.reviews FOR ALL TO authenticated
  USING (business_id = public.current_business_id())
  WITH CHECK (business_id = public.current_business_id());

-- ai_logs (immutable: select + insert only; no update/delete)
CREATE POLICY "ai_select_biz" ON public.ai_logs FOR SELECT TO authenticated
  USING (business_id = public.current_business_id() OR user_id = auth.uid());
CREATE POLICY "ai_insert_biz" ON public.ai_logs FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
