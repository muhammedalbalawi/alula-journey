-- First, let's check if the tourist-photos bucket exists and fix storage policies
-- Check if bucket exists, if not create it
INSERT INTO storage.buckets (id, name, public)
VALUES ('tourist-photos', 'tourist-photos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Create comprehensive storage policies for tourist-photos bucket
-- Allow everyone to view public files
CREATE POLICY "Anyone can view tourist photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'tourist-photos');

-- Allow authenticated users to upload their own photos
CREATE POLICY "Users can upload their own photos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'tourist-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to update their own photos
CREATE POLICY "Users can update their own photos" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'tourist-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to delete their own photos
CREATE POLICY "Users can delete their own photos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'tourist-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Enable realtime for tourist_photos table
ALTER TABLE public.tourist_photos REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE public.tourist_photos;

-- Enable realtime for tourist_experiences table
ALTER TABLE public.tourist_experiences REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE public.tourist_experiences;