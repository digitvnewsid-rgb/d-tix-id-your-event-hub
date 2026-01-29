-- =============================================
-- D-tix ID Database Schema
-- Ticketing & Creator Monetization Platform
-- =============================================

-- 1. Create ENUM for user roles
CREATE TYPE public.app_role AS ENUM ('buyer', 'creator', 'organizer');

-- 2. Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'buyer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- 4. Create categories table
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Create events table
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  event_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  location TEXT NOT NULL,
  venue_name TEXT,
  city TEXT,
  cover_image TEXT,
  is_published BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Create price_tiers table
CREATE TABLE public.price_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price BIGINT NOT NULL DEFAULT 0,
  quantity_total INTEGER NOT NULL DEFAULT 100,
  quantity_sold INTEGER NOT NULL DEFAULT 0,
  sale_start TIMESTAMPTZ,
  sale_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Create tickets table
CREATE TABLE public.tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  price_tier_id UUID NOT NULL REFERENCES public.price_tiers(id) ON DELETE CASCADE,
  qr_code TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'used', 'cancelled', 'refunded')),
  purchased_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  checked_in_at TIMESTAMPTZ
);

-- 8. Create event_images table
CREATE TABLE public.event_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- Helper Functions (SECURITY DEFINER)
-- =============================================

-- Function to check if user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Function to check if user is organizer of an event
CREATE OR REPLACE FUNCTION public.is_organizer_of_event(_event_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.events
    WHERE id = _event_id AND organizer_id = auth.uid()
  )
$$;

-- Function to check if user is creator or organizer
CREATE OR REPLACE FUNCTION public.is_creator_or_organizer()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role IN ('creator', 'organizer')
  )
$$;

-- =============================================
-- Triggers
-- =============================================

-- Auto-create profile and default role on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  
  -- Assign default buyer role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'buyer');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- Enable RLS on all tables
-- =============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_images ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS Policies
-- =============================================

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Public can view basic profile info"
  ON public.profiles FOR SELECT
  USING (true);

-- User roles policies
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- Categories policies (public read)
CREATE POLICY "Anyone can view categories"
  ON public.categories FOR SELECT
  USING (true);

-- Events policies
CREATE POLICY "Anyone can view published events"
  ON public.events FOR SELECT
  USING (is_published = true OR organizer_id = auth.uid());

CREATE POLICY "Creators can insert events"
  ON public.events FOR INSERT
  WITH CHECK (
    auth.uid() = organizer_id AND 
    public.is_creator_or_organizer()
  );

CREATE POLICY "Organizers can update own events"
  ON public.events FOR UPDATE
  USING (organizer_id = auth.uid());

CREATE POLICY "Organizers can delete own events"
  ON public.events FOR DELETE
  USING (organizer_id = auth.uid());

-- Price tiers policies
CREATE POLICY "Anyone can view price tiers of published events"
  ON public.price_tiers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.events 
      WHERE id = event_id AND (is_published = true OR organizer_id = auth.uid())
    )
  );

CREATE POLICY "Organizers can manage price tiers"
  ON public.price_tiers FOR INSERT
  WITH CHECK (public.is_organizer_of_event(event_id));

CREATE POLICY "Organizers can update price tiers"
  ON public.price_tiers FOR UPDATE
  USING (public.is_organizer_of_event(event_id));

CREATE POLICY "Organizers can delete price tiers"
  ON public.price_tiers FOR DELETE
  USING (public.is_organizer_of_event(event_id));

-- Tickets policies
CREATE POLICY "Users can view own tickets"
  ON public.tickets FOR SELECT
  USING (user_id = auth.uid() OR public.is_organizer_of_event(event_id));

CREATE POLICY "Authenticated users can purchase tickets"
  ON public.tickets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ticket status"
  ON public.tickets FOR UPDATE
  USING (user_id = auth.uid() OR public.is_organizer_of_event(event_id));

-- Event images policies
CREATE POLICY "Anyone can view event images"
  ON public.event_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.events 
      WHERE id = event_id AND (is_published = true OR organizer_id = auth.uid())
    )
  );

CREATE POLICY "Organizers can manage event images"
  ON public.event_images FOR INSERT
  WITH CHECK (public.is_organizer_of_event(event_id));

CREATE POLICY "Organizers can update event images"
  ON public.event_images FOR UPDATE
  USING (public.is_organizer_of_event(event_id));

CREATE POLICY "Organizers can delete event images"
  ON public.event_images FOR DELETE
  USING (public.is_organizer_of_event(event_id));

-- =============================================
-- Seed Categories
-- =============================================
INSERT INTO public.categories (name, slug, icon, description) VALUES
  ('Konser', 'konser', 'music', 'Pertunjukan musik live'),
  ('Festival', 'festival', 'mic-2', 'Festival dan pameran'),
  ('Seminar', 'seminar', 'graduation-cap', 'Seminar dan konferensi'),
  ('Seni & Teater', 'seni-teater', 'palette', 'Pertunjukan seni dan teater'),
  ('Film', 'film', 'film', 'Premier dan screening film'),
  ('Gaming', 'gaming', 'gamepad-2', 'Turnamen dan event gaming'),
  ('Kuliner', 'kuliner', 'utensils', 'Festival makanan dan minuman'),
  ('Charity', 'charity', 'heart', 'Acara amal dan sosial'),
  ('Workshop', 'workshop', 'wrench', 'Kelas dan pelatihan'),
  ('Olahraga', 'olahraga', 'trophy', 'Event dan kompetisi olahraga');