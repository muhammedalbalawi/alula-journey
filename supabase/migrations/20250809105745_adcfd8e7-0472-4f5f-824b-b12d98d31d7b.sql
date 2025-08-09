-- Now that we've migrated the data and updated the code, we can drop the old table
-- First, drop any dependent objects
DROP TRIGGER IF EXISTS create_tour_assignment_on_approval ON public.guide_requests;

-- Drop the old tour_assignments table
DROP TABLE IF EXISTS public.tour_assignments CASCADE;

-- Update RLS policies to remove any references to the old table
-- (Policies have already been updated in the previous migration)