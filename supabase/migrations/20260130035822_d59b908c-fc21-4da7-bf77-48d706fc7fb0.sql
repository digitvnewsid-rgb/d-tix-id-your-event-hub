-- Create promo_banners table
CREATE TABLE public.promo_banners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  image_url TEXT NOT NULL,
  link_url TEXT,
  position TEXT NOT NULL DEFAULT 'top' CHECK (position IN ('top', 'middle')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.promo_banners ENABLE ROW LEVEL SECURITY;

-- Public can view active banners
CREATE POLICY "Anyone can view active banners"
ON public.promo_banners
FOR SELECT
USING (is_active = true);

-- Only organizers/creators can manage banners (admin functionality)
CREATE POLICY "Organizers can manage banners"
ON public.promo_banners
FOR ALL
USING (public.is_creator_or_organizer())
WITH CHECK (public.is_creator_or_organizer());

-- Add trigger for updated_at
CREATE TRIGGER update_promo_banners_updated_at
BEFORE UPDATE ON public.promo_banners
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for banners
INSERT INTO storage.buckets (id, name, public) VALUES ('banners', 'banners', true);

-- Storage policies for banners bucket
CREATE POLICY "Anyone can view banner images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'banners');

CREATE POLICY "Organizers can upload banner images"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'banners' AND public.is_creator_or_organizer());

CREATE POLICY "Organizers can update banner images"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'banners' AND public.is_creator_or_organizer());

CREATE POLICY "Organizers can delete banner images"
ON storage.objects
FOR DELETE
USING (bucket_id = 'banners' AND public.is_creator_or_organizer());