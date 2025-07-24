-- Fix infinite recursion in admin_users policies
DROP POLICY IF EXISTS "Admins can manage admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Admins can manage drivers" ON public.drivers;
DROP POLICY IF EXISTS "Admins can manage packages" ON public.packages;

-- Create non-recursive admin policies
CREATE POLICY "Enable admin access for admin users" 
ON public.admin_users FOR ALL 
USING (user_id = auth.uid());

-- Fix drivers admin policy
CREATE POLICY "Enable admin access for drivers" 
ON public.drivers FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users au 
    WHERE au.user_id = auth.uid() AND au.is_active = true
  )
);

-- Fix packages admin policy  
CREATE POLICY "Enable admin access for packages" 
ON public.packages FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users au 
    WHERE au.user_id = auth.uid() AND au.is_active = true
  )
);

-- Add missing availability_status column to guides table
ALTER TABLE public.guides ADD COLUMN IF NOT EXISTS availability_status text DEFAULT 'available' CHECK (availability_status IN ('available', 'busy', 'offline'));

-- Add missing columns for guide management
ALTER TABLE public.guides ADD COLUMN IF NOT EXISTS languages text[] DEFAULT '{}';
ALTER TABLE public.guides ADD COLUMN IF NOT EXISTS hourly_rate numeric DEFAULT 0;
ALTER TABLE public.guides ADD COLUMN IF NOT EXISTS bio text;
ALTER TABLE public.guides ADD COLUMN IF NOT EXISTS experience_years integer DEFAULT 0;
ALTER TABLE public.guides ADD COLUMN IF NOT EXISTS certifications text[] DEFAULT '{}';
ALTER TABLE public.guides ADD COLUMN IF NOT EXISTS location text;

-- Ensure realtime is enabled for all relevant tables
ALTER TABLE public.guides REPLICA IDENTITY FULL;
ALTER TABLE public.guide_requests REPLICA IDENTITY FULL;
ALTER TABLE public.drivers REPLICA IDENTITY FULL;
ALTER TABLE public.packages REPLICA IDENTITY FULL;
ALTER TABLE public.admin_users REPLICA IDENTITY FULL;