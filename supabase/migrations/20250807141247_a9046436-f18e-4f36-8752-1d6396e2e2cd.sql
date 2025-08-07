-- Drop the existing tourist activity view policy
DROP POLICY IF EXISTS "Tourists can view assigned activities" ON public.activities;

-- Create a new, more comprehensive policy for tourists viewing activities
CREATE POLICY "Tourists can view their assigned activities" 
ON public.activities 
FOR SELECT 
USING (
  -- Tourist can view activities assigned to them directly
  (tourist_id = auth.uid()) 
  OR 
  -- OR tourist can view activities from their assigned guide
  (EXISTS ( 
    SELECT 1
    FROM tour_assignments ta
    WHERE (ta.tourist_id = auth.uid()) 
    AND (ta.guide_id = activities.tour_guide_id) 
    AND (ta.status = 'active'::text)
  ))
);