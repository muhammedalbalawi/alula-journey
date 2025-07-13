-- Remove the existing foreign key constraint if it exists
ALTER TABLE public.tour_assignments 
DROP CONSTRAINT IF EXISTS tour_assignments_guide_id_fkey;

-- Add the correct foreign key constraint to reference guides table
ALTER TABLE public.tour_assignments 
ADD CONSTRAINT tour_assignments_guide_id_fkey 
FOREIGN KEY (guide_id) REFERENCES public.guides(id) ON DELETE CASCADE;

-- Now create the missing tour assignments
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
);