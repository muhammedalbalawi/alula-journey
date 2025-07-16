-- Create tourist_experiences table for shared experiences
CREATE TABLE public.tourist_experiences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  photo_id UUID NOT NULL REFERENCES public.tourist_photos(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  location_name TEXT,
  destinations TEXT[],
  rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.tourist_experiences ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for tourist_experiences
CREATE POLICY "Everyone can view shared experiences" 
ON public.tourist_experiences 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own experiences" 
ON public.tourist_experiences 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own experiences" 
ON public.tourist_experiences 
FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own experiences" 
ON public.tourist_experiences 
FOR DELETE 
USING (user_id = auth.uid());

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_tourist_experiences_updated_at
BEFORE UPDATE ON public.tourist_experiences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for tourist_experiences table
ALTER PUBLICATION supabase_realtime ADD TABLE tourist_experiences;