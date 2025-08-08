-- Step 1: Add columns to activities table to include tour assignment data
ALTER TABLE public.activities 
ADD COLUMN IF NOT EXISTS tour_name TEXT DEFAULT 'AlUla Heritage Tour',
ADD COLUMN IF NOT EXISTS start_date DATE,
ADD COLUMN IF NOT EXISTS end_date DATE,
ADD COLUMN IF NOT EXISTS assignment_status TEXT DEFAULT 'active';

-- Step 2: Update existing activities with tour assignment data from tour_assignments
UPDATE public.activities 
SET 
  tour_name = ta.tour_name,
  start_date = ta.start_date,
  end_date = ta.end_date,
  assignment_status = ta.status
FROM tour_assignments ta
WHERE activities.tourist_id = ta.tourist_id 
AND activities.tour_guide_id = ta.guide_id;

-- Step 3: Create a view for backward compatibility (optional)
CREATE OR REPLACE VIEW tour_assignments_view AS
SELECT DISTINCT
  gen_random_uuid() as id,
  tourist_id,
  tour_guide_id as guide_id,
  start_date,
  end_date,
  created_at,
  updated_at,
  tour_name,
  assignment_status as status
FROM activities
WHERE assignment_status IS NOT NULL;