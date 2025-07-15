-- Fix RLS policies for activities table to work with guide login system
-- Drop existing policies
DROP POLICY IF EXISTS "Guides can manage tour activities" ON public.activities;
DROP POLICY IF EXISTS "Tour participants can view activities" ON public.activities;

-- Create new policies that work with our guide system
CREATE POLICY "Guides can manage activities" 
ON public.activities 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM guides g 
    WHERE g.id = activities.tour_guide_id
  )
);

CREATE POLICY "Guides can view activities by guide_id" 
ON public.activities 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM guides g 
    WHERE g.id = activities.tour_guide_id
  )
);

CREATE POLICY "Tourists can view assigned activities" 
ON public.activities 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM tour_assignments ta 
    WHERE ta.tourist_id = auth.uid() 
    AND ta.guide_id = activities.tour_guide_id
    AND ta.status = 'active'
  )
);

-- Enable realtime for activities table
ALTER PUBLICATION supabase_realtime ADD TABLE activities;