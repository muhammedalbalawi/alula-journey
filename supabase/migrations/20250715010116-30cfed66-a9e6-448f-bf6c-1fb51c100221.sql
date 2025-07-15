-- Add phone number field to profiles table
ALTER TABLE public.profiles ADD COLUMN phone_number text;

-- Add sharing preference to tourist_photos table
ALTER TABLE public.tourist_photos ADD COLUMN share_with_world boolean DEFAULT false;

-- Create countries table with country codes and flags if it doesn't exist (checking existing structure)
-- Note: This table already exists, so we'll skip this step

-- Add tour schedule form functionality - activities table already exists and supports this