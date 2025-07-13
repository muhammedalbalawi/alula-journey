-- Add gender column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN gender text CHECK (gender IN ('male', 'female'));

-- Create guide_requests table for tourists to request guides
CREATE TABLE public.guide_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tourist_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  request_message text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  assigned_guide_id uuid REFERENCES public.guides(id) ON DELETE SET NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  admin_response text
);

-- Enable RLS on guide_requests
ALTER TABLE public.guide_requests ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for guide_requests
CREATE POLICY "Tourists can create guide requests" 
ON public.guide_requests 
FOR INSERT 
WITH CHECK (auth.uid() = tourist_id);

CREATE POLICY "Tourists can view their own requests" 
ON public.guide_requests 
FOR SELECT 
USING (auth.uid() = tourist_id);

CREATE POLICY "Admin can view all guide requests" 
ON public.guide_requests 
FOR SELECT 
USING (true);

CREATE POLICY "Admin can update guide requests" 
ON public.guide_requests 
FOR UPDATE 
USING (true);

-- Create trigger for updated_at timestamp
CREATE TRIGGER update_guide_requests_updated_at
BEFORE UPDATE ON public.guide_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();