-- Create function to automatically create tour assignment when guide request is approved
CREATE OR REPLACE FUNCTION public.create_tour_assignment_on_approval()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create assignment when status changes to 'approved' and guide is assigned
  IF NEW.status = 'approved' AND NEW.assigned_guide_id IS NOT NULL AND 
     (OLD.status IS NULL OR OLD.status != 'approved') THEN
    
    -- Check if assignment already exists to avoid duplicates
    IF NOT EXISTS (
      SELECT 1 FROM public.tour_assignments 
      WHERE tourist_id = NEW.tourist_id 
      AND guide_id = NEW.assigned_guide_id 
      AND status IN ('pending', 'active')
    ) THEN
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
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists and create new one
DROP TRIGGER IF EXISTS create_assignment_on_approval ON public.guide_requests;
CREATE TRIGGER create_assignment_on_approval
AFTER UPDATE ON public.guide_requests
FOR EACH ROW
EXECUTE FUNCTION public.create_tour_assignment_on_approval();

-- Update guide_requests table to have proper foreign key to guides table
ALTER TABLE public.guide_requests 
DROP CONSTRAINT IF EXISTS guide_requests_assigned_guide_id_fkey;

ALTER TABLE public.guide_requests 
ADD CONSTRAINT guide_requests_assigned_guide_id_fkey 
FOREIGN KEY (assigned_guide_id) REFERENCES public.guides(id);

-- Ensure realtime is enabled for tour_assignments
ALTER TABLE public.tour_assignments REPLICA IDENTITY FULL;