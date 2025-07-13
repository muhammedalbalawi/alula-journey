-- Create guides table for tour guide management
CREATE TABLE public.guides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guide_id TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT NOT NULL,
    specializations TEXT[] DEFAULT '{}',
    rating DECIMAL(3, 2) DEFAULT 0.0,
    status TEXT DEFAULT 'available' CHECK (status IN ('available', 'busy', 'offline')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.guides ENABLE ROW LEVEL SECURITY;

-- Create policies for guides table
CREATE POLICY "Guides can view their own profile" 
ON public.guides 
FOR SELECT 
USING (guide_id = current_setting('app.current_guide_id', true));

CREATE POLICY "Guides can update their own profile" 
ON public.guides 
FOR UPDATE 
USING (guide_id = current_setting('app.current_guide_id', true));

-- Admin can manage all guides (for now, we'll use a simple admin check)
CREATE POLICY "Admin can manage guides" 
ON public.guides 
FOR ALL 
USING (current_setting('app.current_user_role', true) = 'admin');

-- Create function to update timestamps
CREATE TRIGGER update_guides_updated_at
BEFORE UPDATE ON public.guides
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default guides
INSERT INTO public.guides (guide_id, password, name, email, phone, specializations, rating, status) VALUES
('guide123', 'password123', 'Khalid Al-Otaibi', 'khalid@guides.sa', '+966551234567', ARRAY['Heritage Sites', 'Desert Adventures'], 4.8, 'busy'),
('guide456', 'password456', 'Fatima Al-Zahra', 'fatima@guides.sa', '+966559876543', ARRAY['Cultural Tours', 'Photography'], 4.9, 'busy');