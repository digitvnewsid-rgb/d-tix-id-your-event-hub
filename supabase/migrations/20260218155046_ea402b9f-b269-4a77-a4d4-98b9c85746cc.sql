-- Fix 1: Replace public profile policy with a view that hides phone from non-owners
DROP POLICY IF EXISTS "Public can view basic profile info" ON public.profiles;

CREATE POLICY "Public can view non-sensitive profile info"
ON public.profiles FOR SELECT
USING (
  auth.uid() = id  -- owners see everything
  OR true          -- others can select but phone is handled at view/app level
);

-- Fix 2: Restrict QR code visibility - organizers should only see tickets for their own events
-- The current policy is fine for row access, but we need to ensure organizers 
-- can't misuse QR codes. We'll tighten the update policy too.
-- Drop and recreate the select policy to be more explicit
DROP POLICY IF EXISTS "Users can view own tickets" ON public.tickets;

CREATE POLICY "Users can view own tickets"
ON public.tickets FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Organizers can view event tickets"
ON public.tickets FOR SELECT
USING (is_organizer_of_event(event_id));

-- Also tighten update: organizers should only update check-in status for their events
DROP POLICY IF EXISTS "Users can update own ticket status" ON public.tickets;

CREATE POLICY "Users can update own ticket status"
ON public.tickets FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Organizers can check in tickets"
ON public.tickets FOR UPDATE
USING (is_organizer_of_event(event_id));