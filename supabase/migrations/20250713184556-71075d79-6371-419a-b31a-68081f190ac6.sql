-- Create storage bucket for tourist photos
INSERT INTO storage.buckets (id, name, public) VALUES ('tourist-photos', 'tourist-photos', true);

-- Create table for photo metadata
CREATE TABLE public.tourist_photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  content_type TEXT,
  caption TEXT,
  location_name TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for photo comments
CREATE TABLE public.photo_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  photo_id UUID NOT NULL REFERENCES public.tourist_photos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  comment_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tourist_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photo_comments ENABLE ROW LEVEL SECURITY;

-- RLS policies for tourist_photos
CREATE POLICY "Users can view their own photos" 
ON public.tourist_photos 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can upload their own photos" 
ON public.tourist_photos 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own photos" 
ON public.tourist_photos 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own photos" 
ON public.tourist_photos 
FOR DELETE 
USING (auth.uid() = user_id);

-- RLS policies for photo_comments
CREATE POLICY "Users can view comments on their photos" 
ON public.photo_comments 
FOR SELECT 
USING (
  auth.uid() = user_id OR 
  EXISTS (
    SELECT 1 FROM public.tourist_photos 
    WHERE id = photo_comments.photo_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can add comments" 
ON public.photo_comments 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" 
ON public.photo_comments 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" 
ON public.photo_comments 
FOR DELETE 
USING (auth.uid() = user_id);

-- Storage policies for tourist-photos bucket
CREATE POLICY "Users can view their own photos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'tourist-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'tourist-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own photos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'tourist-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own photos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'tourist-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add update triggers
CREATE TRIGGER update_tourist_photos_updated_at
BEFORE UPDATE ON public.tourist_photos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_photo_comments_updated_at
BEFORE UPDATE ON public.photo_comments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();