-- Remove all activities from the database
DELETE FROM activities;

-- Fix Security Definer View issue by recreating tour_assignments_view without SECURITY DEFINER
DROP VIEW IF EXISTS tour_assignments_view;

CREATE VIEW tour_assignments_view AS
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
WHERE tourist_id IS NOT NULL 
AND tour_guide_id IS NOT NULL;

-- Add comment for clarity
COMMENT ON VIEW tour_assignments_view IS 'View showing unique tour assignments derived from activities table';