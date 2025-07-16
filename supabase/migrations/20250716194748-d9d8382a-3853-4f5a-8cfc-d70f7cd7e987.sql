-- Drop existing storage policies and recreate them properly
DROP POLICY IF EXISTS "Users can upload their own photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own photos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view tourist photos" ON storage.objects;

-- Ensure bucket exists and is public
INSERT INTO storage.buckets (id, name, public)
VALUES ('tourist-photos', 'tourist-photos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Create comprehensive storage policies for tourist-photos bucket
CREATE POLICY "Anyone can view tourist photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'tourist-photos');

CREATE POLICY "Users can upload their own photos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'tourist-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own photos" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'tourist-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own photos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'tourist-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );