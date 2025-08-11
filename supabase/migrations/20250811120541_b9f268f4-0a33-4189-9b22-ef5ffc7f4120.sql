-- Create tour_assignments table
CREATE TABLE public.tour_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tourist_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  guide_id UUID NOT NULL REFERENCES public.guides(id) ON DELETE CASCADE,
  tour_name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tour_assignments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Guides can view their assigned tours" 
ON public.tour_assignments 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage all tour assignments" 
ON public.tour_assignments 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = auth.uid() AND is_active = true
  )
);

-- Create indexes for better performance
CREATE INDEX idx_tour_assignments_tourist_id ON public.tour_assignments(tourist_id);
CREATE INDEX idx_tour_assignments_guide_id ON public.tour_assignments(guide_id);
CREATE INDEX idx_tour_assignments_status ON public.tour_assignments(status);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_tour_assignments_updated_at
BEFORE UPDATE ON public.tour_assignments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();