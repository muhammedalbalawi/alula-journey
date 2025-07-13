-- Update RLS policies for tour_assignments to work with guides table
DROP POLICY IF EXISTS "Guides can create tour assignments" ON public.tour_assignments;
DROP POLICY IF EXISTS "Tour participants can update assignments" ON public.tour_assignments; 
DROP POLICY IF EXISTS "Users can view their tour assignments" ON public.tour_assignments;

-- Create new RLS policies
CREATE POLICY "Guides can create tour assignments" 
ON public.tour_assignments FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.guides g 
    WHERE g.id = guide_id
  )
);

CREATE POLICY "Tour participants can update assignments" 
ON public.tour_assignments FOR UPDATE 
USING (
  auth.uid() = tourist_id OR 
  EXISTS (
    SELECT 1 FROM public.guides g 
    WHERE g.id = guide_id AND auth.uid()::text = g.guide_id
  )
);

CREATE POLICY "Users can view their tour assignments" 
ON public.tour_assignments FOR SELECT 
USING (
  auth.uid() = tourist_id OR 
  EXISTS (
    SELECT 1 FROM public.guides g 
    WHERE g.id = guide_id AND auth.uid()::text = g.guide_id
  )
);