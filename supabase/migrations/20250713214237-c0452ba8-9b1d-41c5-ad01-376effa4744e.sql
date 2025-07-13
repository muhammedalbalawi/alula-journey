-- Fix RLS policies with proper type casting
DROP POLICY IF EXISTS "Tour participants can update assignments" ON public.tour_assignments; 
DROP POLICY IF EXISTS "Users can view their tour assignments" ON public.tour_assignments;

-- Create new RLS policies with proper type casting
CREATE POLICY "Tour participants can update assignments" 
ON public.tour_assignments FOR UPDATE 
USING (
  auth.uid() = tourist_id
);

CREATE POLICY "Users can view their tour assignments" 
ON public.tour_assignments FOR SELECT 
USING (
  auth.uid() = tourist_id
);

-- Note: Guide access will be handled through the guide login system in the app
-- since guides use a separate authentication system with guide_id/password