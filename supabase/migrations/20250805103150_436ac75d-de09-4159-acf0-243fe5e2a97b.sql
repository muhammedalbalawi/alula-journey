-- Update the activities table category constraint to include 'events'
ALTER TABLE activities DROP CONSTRAINT IF EXISTS tour_activities_category_check;
ALTER TABLE activities ADD CONSTRAINT activities_category_check 
CHECK (category IN ('heritage', 'attraction', 'adventure', 'events'));

-- Enable realtime for activities table
ALTER TABLE activities REPLICA IDENTITY FULL;

-- Add activities to realtime publication if not already added
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'activities'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE activities;
    END IF;
END $$;