-- First, let's manually create the missing tour assignments for the approved requests
INSERT INTO public.tour_assignments (
  tourist_id,
  guide_id,
  tour_name,
  start_date,
  status
) 
SELECT 
  gr.tourist_id,
  p.id as guide_id,
  'AlUla Heritage Tour',
  CURRENT_DATE + INTERVAL '1 day',
  'active'
FROM public.guide_requests gr
JOIN public.guides g ON gr.assigned_guide_id = g.id
JOIN public.profiles p ON g.guide_id = p.id  -- This should link guide to profile
WHERE gr.status = 'approved' 
AND NOT EXISTS (
  SELECT 1 FROM public.tour_assignments ta 
  WHERE ta.tourist_id = gr.tourist_id 
  AND ta.guide_id = p.id
);

-- If the above doesn't work because guide_id is not in profiles, try this alternative:
-- Let's check if we need to use the guides.id directly instead of linking through profiles
INSERT INTO public.tour_assignments (
  tourist_id,
  guide_id,
  tour_name,
  start_date,
  status
) 
SELECT DISTINCT
  gr.tourist_id,
  gr.assigned_guide_id,
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
)
ON CONFLICT DO NOTHING;