-- Create guide_ratings table for tourist ratings of guides
CREATE TABLE public.guide_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tourist_id UUID NOT NULL,
  guide_id UUID NOT NULL REFERENCES public.guides(id) ON DELETE CASCADE,
  tour_assignment_id UUID REFERENCES public.tour_assignments(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(tourist_id, guide_id)
);

-- Enable Row Level Security
ALTER TABLE public.guide_ratings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Tourists can create their own ratings" 
ON public.guide_ratings 
FOR INSERT 
WITH CHECK (tourist_id = auth.uid());

CREATE POLICY "Tourists can update their own ratings" 
ON public.guide_ratings 
FOR UPDATE 
USING (tourist_id = auth.uid());

CREATE POLICY "Tourists can view their own ratings" 
ON public.guide_ratings 
FOR SELECT 
USING (tourist_id = auth.uid());

CREATE POLICY "Guides can view ratings for themselves" 
ON public.guide_ratings 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM guides g 
    WHERE g.id = guide_ratings.guide_id 
    AND g.guide_id = current_setting('app.current_guide_id', true)
  )
);

-- Create function to update updated_at column
CREATE TRIGGER update_guide_ratings_updated_at
BEFORE UPDATE ON public.guide_ratings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for guide_ratings table
ALTER PUBLICATION supabase_realtime ADD TABLE guide_ratings;