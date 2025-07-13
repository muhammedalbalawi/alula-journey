-- Create tour assignments using the guides.id directly
-- since tour_assignments.guide_id should reference profiles.id but we need to create profiles for guides first

-- First, create profiles for guides if they don't exist
INSERT INTO public.profiles (id, full_name, user_type)
SELECT g.id, g.name, 'guide'
FROM public.guides g
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p 
  WHERE p.id = g.id
);

-- Now create the tour assignments
INSERT INTO public.tour_assignments (
  tourist_id,
  guide_id,
  tour_name,
  start_date,
  status
) 
SELECT DISTINCT
  gr.tourist_id,
  gr.assigned_guide_id, -- This should now match profiles.id
  'AlUla Heritage Tour',
  CURRENT_DATE + INTERVAL '1 day',
  'active'
FROM public.guide_requests gr
WHERE gr.status = 'approved' 
AND gr.assigned_guide_id IS NOT NULL
AND NOT EXISTS (
  SELECT 1 FROM public.tour_assignments ta 
  WHERE ta.tourist_id = gr.tourist_id 
  AND ta.guide_id = gr.assigned_guide_id
);