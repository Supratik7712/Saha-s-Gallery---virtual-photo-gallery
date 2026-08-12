CREATE TABLE public.gallery_visits (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  visitor_id text NOT NULL,
  path text NOT NULL DEFAULT '/',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX gallery_visits_created_at_idx ON public.gallery_visits (created_at DESC);
CREATE INDEX gallery_visits_visitor_idx ON public.gallery_visits (visitor_id);

GRANT INSERT ON public.gallery_visits TO anon;
GRANT INSERT, SELECT ON public.gallery_visits TO authenticated;
GRANT ALL ON public.gallery_visits TO service_role;

ALTER TABLE public.gallery_visits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can log a visit"
ON public.gallery_visits
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Admins can read visits"
ON public.gallery_visits
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));