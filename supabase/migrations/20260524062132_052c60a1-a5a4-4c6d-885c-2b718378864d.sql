CREATE TABLE public.seo_keywords (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL,
  keyword text NOT NULL,
  position integer,
  previous_position integer,
  search_volume integer,
  difficulty integer,
  target_url text,
  intent text CHECK (intent IN ('informational','commercial','transactional','navigational')),
  last_checked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (business_id, keyword)
);

CREATE INDEX idx_seo_keywords_business ON public.seo_keywords(business_id);

ALTER TABLE public.seo_keywords ENABLE ROW LEVEL SECURITY;

CREATE POLICY seo_all_biz ON public.seo_keywords
  FOR ALL TO authenticated
  USING (business_id = public.current_business_id())
  WITH CHECK (business_id = public.current_business_id());

CREATE TRIGGER seo_keywords_updated_at
  BEFORE UPDATE ON public.seo_keywords
  FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();