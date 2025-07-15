-- Fix foreign key constraint for activities table
-- Drop the incorrect foreign key constraint
ALTER TABLE public.activities DROP CONSTRAINT IF EXISTS activities_tour_guide_id_fkey;

-- Add correct foreign key constraint to reference guides table
ALTER TABLE public.activities 
ADD CONSTRAINT activities_tour_guide_id_fkey 
FOREIGN KEY (tour_guide_id) REFERENCES public.guides(id);