-- Step 1: Add columns to activities table to include tour assignment data
ALTER TABLE public.activities 
ADD COLUMN IF NOT EXISTS tour_name TEXT DEFAULT 'AlUla Heritage Tour',
ADD COLUMN IF NOT EXISTS start_date DATE,
ADD COLUMN IF NOT EXISTS end_date DATE,
ADD COLUMN IF NOT EXISTS assignment_status TEXT DEFAULT 'active';

-- Step 2: Migrate data from tour_assignments to activities
-- For each tour assignment, create a base activity record if none exists
INSERT INTO public.activities (
  tourist_id,
  tour_guide_id,
  tour_name,
  start_date,
  end_date,
  assignment_status,
  activity_name,
  location_name,
  category,
  scheduled_date,
  scheduled_time,
  duration_minutes,
  status,
  created_at,
  updated_at
)
SELECT DISTINCT
  ta.tourist_id,
  ta.guide_id,
  ta.tour_name,
  ta.start_date,
  ta.end_date,
  ta.status,
  'Tour Assignment',
  'General Assignment',
  'assignment',
  ta.start_date,
  '09:00:00',
  480, -- 8 hours default
  'planned',
  ta.created_at,
  ta.updated_at
FROM tour_assignments ta
WHERE NOT EXISTS (
  SELECT 1 FROM activities a 
  WHERE a.tourist_id = ta.tourist_id 
  AND a.tour_guide_id = ta.guide_id
  AND a.category = 'assignment'
);

-- Step 3: Update existing activities with tour assignment data
UPDATE public.activities 
SET 
  tour_name = ta.tour_name,
  start_date = ta.start_date,
  end_date = ta.end_date,
  assignment_status = ta.status
FROM tour_assignments ta
WHERE activities.tourist_id = ta.tourist_id 
AND activities.tour_guide_id = ta.guide_id;