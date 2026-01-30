-- Add admin-level RLS policies for full database management

-- Function to check if user is admin (organizer role)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'organizer'
  )
$$;

-- Profiles: Admin can view all profiles
CREATE POLICY "Admin can view all profiles"
ON public.profiles
FOR SELECT
USING (public.is_admin());

-- Profiles: Admin can update all profiles  
CREATE POLICY "Admin can update all profiles"
ON public.profiles
FOR UPDATE
USING (public.is_admin());

-- User roles: Admin can view all roles
CREATE POLICY "Admin can view all roles"
ON public.user_roles
FOR SELECT
USING (public.is_admin());

-- User roles: Admin can insert roles
CREATE POLICY "Admin can insert roles"
ON public.user_roles
FOR INSERT
WITH CHECK (public.is_admin());

-- User roles: Admin can update roles
CREATE POLICY "Admin can update roles"
ON public.user_roles
FOR UPDATE
USING (public.is_admin());

-- User roles: Admin can delete roles
CREATE POLICY "Admin can delete roles"
ON public.user_roles
FOR DELETE
USING (public.is_admin());

-- Categories: Admin can manage categories
CREATE POLICY "Admin can insert categories"
ON public.categories
FOR INSERT
WITH CHECK (public.is_admin());

CREATE POLICY "Admin can update categories"
ON public.categories
FOR UPDATE
USING (public.is_admin());

CREATE POLICY "Admin can delete categories"
ON public.categories
FOR DELETE
USING (public.is_admin());

-- Events: Admin can view all events
CREATE POLICY "Admin can view all events"
ON public.events
FOR SELECT
USING (public.is_admin());

-- Events: Admin can update all events
CREATE POLICY "Admin can update all events"
ON public.events
FOR UPDATE
USING (public.is_admin());

-- Events: Admin can delete all events
CREATE POLICY "Admin can delete all events"
ON public.events
FOR DELETE
USING (public.is_admin());

-- Tickets: Admin can view all tickets
CREATE POLICY "Admin can view all tickets"
ON public.tickets
FOR SELECT
USING (public.is_admin());

-- Tickets: Admin can update all tickets
CREATE POLICY "Admin can update all tickets"
ON public.tickets
FOR UPDATE
USING (public.is_admin());

-- Price tiers: Admin can manage all price tiers
CREATE POLICY "Admin can view all price tiers"
ON public.price_tiers
FOR SELECT
USING (public.is_admin());

CREATE POLICY "Admin can insert price tiers"
ON public.price_tiers
FOR INSERT
WITH CHECK (public.is_admin());

CREATE POLICY "Admin can update all price tiers"
ON public.price_tiers
FOR UPDATE
USING (public.is_admin());

CREATE POLICY "Admin can delete all price tiers"
ON public.price_tiers
FOR DELETE
USING (public.is_admin());

-- Promo banners: Already has organizer policies, add explicit admin
CREATE POLICY "Admin can view all banners"
ON public.promo_banners
FOR SELECT
USING (public.is_admin());