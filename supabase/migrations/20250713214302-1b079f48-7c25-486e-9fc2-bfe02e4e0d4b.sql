-- Add policy to allow guides to view their assigned tourists
-- Since guides use separate authentication, we need a more permissive policy
CREATE POLICY "Guides can view assignments"
ON public.tour_assignments FOR SELECT
USING (true);  -- This allows guides to query their assignments through the app

-- Also allow guides to update assignments
CREATE POLICY "Guides can update assignments" 
ON public.tour_assignments FOR UPDATE 
USING (true);