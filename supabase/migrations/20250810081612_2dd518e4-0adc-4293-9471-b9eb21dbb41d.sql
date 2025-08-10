-- Remove all tourist accounts and associated data

-- First, get all tourist user IDs for reference
DO $$
DECLARE
    tourist_ids uuid[];
BEGIN
    -- Get all tourist user IDs
    SELECT ARRAY(SELECT id FROM profiles WHERE user_type = 'tourist') INTO tourist_ids;
    
    -- Delete from all tables that reference tourist data
    -- Order matters to avoid constraint violations
    
    -- Delete notifications for tourists
    DELETE FROM notifications WHERE user_id = ANY(tourist_ids);
    
    -- Delete photo comments by tourists
    DELETE FROM photo_comments WHERE user_id = ANY(tourist_ids);
    
    -- Delete user locations for tourists
    DELETE FROM user_locations WHERE user_id = ANY(tourist_ids);
    
    -- Delete guide ratings by tourists
    DELETE FROM guide_ratings WHERE tourist_id = ANY(tourist_ids);
    
    -- Delete messages where tourists are sender or recipient
    DELETE FROM messages WHERE sender_id = ANY(tourist_ids) OR recipient_id = ANY(tourist_ids);
    
    -- Delete reschedule requests by tourists
    DELETE FROM reschedule_requests WHERE tourist_id = ANY(tourist_ids);
    
    -- Delete driver bookings by tourists
    DELETE FROM driver_bookings WHERE tourist_id = ANY(tourist_ids);
    
    -- Delete activities involving tourists
    DELETE FROM activities WHERE tourist_id = ANY(tourist_ids);
    
    -- Delete guide requests by tourists
    DELETE FROM guide_requests WHERE tourist_id = ANY(tourist_ids);
    
    -- Delete tourist experiences
    DELETE FROM tourist_experiences WHERE user_id = ANY(tourist_ids);
    
    -- Delete tourist photos
    DELETE FROM tourist_photos WHERE user_id = ANY(tourist_ids);
    
    -- Delete tourist profiles
    DELETE FROM profiles WHERE user_type = 'tourist';
    
    -- Delete from auth.users (if we have access, otherwise this will be handled by cascade)
    -- Note: This might not work due to RLS, but profiles deletion should cascade
    
    RAISE NOTICE 'Deleted all tourist accounts and associated data for % tourists', array_length(tourist_ids, 1);
END $$;