-- Create drivers table for driver registration
CREATE TABLE public.drivers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  license_number TEXT NOT NULL,
  car_model TEXT NOT NULL,
  car_color TEXT,
  plate_number TEXT NOT NULL,
  status TEXT DEFAULT 'available',
  rating NUMERIC DEFAULT 0.0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID
);

-- Enable RLS
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;

-- Create policies for drivers
CREATE POLICY "Admins can manage drivers"
ON public.drivers
FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.admin_users au 
  WHERE au.user_id = auth.uid() AND au.is_active = true
));

CREATE POLICY "Drivers can view their own profile"
ON public.drivers
FOR SELECT
USING (driver_id = current_setting('app.current_driver_id', true));

-- Create packages table for tour packages
CREATE TABLE public.packages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  package_name TEXT NOT NULL,
  description TEXT,
  duration_hours INTEGER,
  price NUMERIC,
  included_activities TEXT[],
  max_participants INTEGER,
  difficulty_level TEXT DEFAULT 'easy',
  status TEXT DEFAULT 'active',
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;

-- Create policies for packages
CREATE POLICY "Everyone can view active packages"
ON public.packages
FOR SELECT
USING (status = 'active');

CREATE POLICY "Guides can manage packages"
ON public.packages
FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.guides g 
  WHERE g.guide_id = current_setting('app.current_guide_id', true)
));

CREATE POLICY "Admins can manage packages"
ON public.packages
FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.admin_users au 
  WHERE au.user_id = auth.uid() AND au.is_active = true
));

-- Add triggers for updated_at
CREATE TRIGGER update_drivers_updated_at
  BEFORE UPDATE ON public.drivers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_packages_updated_at
  BEFORE UPDATE ON public.packages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();