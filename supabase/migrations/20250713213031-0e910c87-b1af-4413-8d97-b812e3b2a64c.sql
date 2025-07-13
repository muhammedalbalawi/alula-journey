-- Create tour_assignments table to properly track guide-tourist assignments
CREATE TABLE IF NOT EXISTS public.tour_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tourist_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  guide_id UUID NOT NULL REFERENCES public.guides(id) ON DELETE CASCADE,
  tour_name TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(tourist_id, guide_id, start_date) -- Prevent duplicate assignments for same tourist-guide-date
);

-- Enable RLS on tour_assignments
ALTER TABLE public.tour_assignments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tour_assignments
CREATE POLICY "Tour participants can view their assignments" 
ON public.tour_assignments 
FOR SELECT 
USING ((auth.uid() = tourist_id) OR (auth.uid() = guide_id));

CREATE POLICY "Guides can create tour assignments" 
ON public.tour_assignments 
FOR INSERT 
WITH CHECK (auth.uid() = guide_id);

CREATE POLICY "Tour participants can update assignments" 
ON public.tour_assignments 
FOR UPDATE 
USING ((auth.uid() = tourist_id) OR (auth.uid() = guide_id));

-- Create trigger for tour_assignments updated_at
CREATE TRIGGER update_tour_assignments_updated_at
BEFORE UPDATE ON public.tour_assignments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Update guide_requests table to have proper foreign key to guides table
ALTER TABLE public.guide_requests 
DROP CONSTRAINT IF EXISTS guide_requests_assigned_guide_id_fkey;

ALTER TABLE public.guide_requests 
ADD CONSTRAINT guide_requests_assigned_guide_id_fkey 
FOREIGN KEY (assigned_guide_id) REFERENCES public.guides(id);

-- Create function to automatically create tour assignment when guide request is approved
CREATE OR REPLACE FUNCTION public.create_tour_assignment_on_approval()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create assignment when status changes to 'approved' and guide is assigned
  IF NEW.status = 'approved' AND NEW.assigned_guide_id IS NOT NULL AND 
     (OLD.status IS NULL OR OLD.status != 'approved') THEN
    
    INSERT INTO public.tour_assignments (
      tourist_id,
      guide_id,
      tour_name,
      start_date,
      status
    ) VALUES (
      NEW.tourist_id,
      NEW.assigned_guide_id,
      'AlUla Heritage Tour',
      CURRENT_DATE + INTERVAL '1 day',
      'active'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create tour assignment when guide request is approved
CREATE TRIGGER create_assignment_on_approval
AFTER UPDATE ON public.guide_requests
FOR EACH ROW
EXECUTE FUNCTION public.create_tour_assignment_on_approval();

-- Enable realtime for tour_assignments
ALTER TABLE public.tour_assignments REPLICA IDENTITY FULL;
-- Note: The publication is already configured in previous migrations