-- First, add the current user as an admin
INSERT INTO public.admin_users (user_id, admin_role, is_active) 
VALUES ('d8eab175-77bc-4208-9bb4-178709a9e033', 'admin', true)
ON CONFLICT (user_id) DO UPDATE SET is_active = true;

-- Also ensure we have proper policies for driver registration
-- Allow admin users to insert drivers 
DROP POLICY IF EXISTS "Admins can insert drivers" ON public.drivers;
CREATE POLICY "Admins can insert drivers" 
ON public.drivers 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.admin_users 
  WHERE user_id = auth.uid() AND is_active = true
));

-- Update the driver booking management policy as well
DROP POLICY IF EXISTS "Admins can manage all bookings" ON public.driver_bookings;
CREATE POLICY "Admins can manage all bookings" 
ON public.driver_bookings 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.admin_users 
  WHERE user_id = auth.uid() AND is_active = true
));

-- Add policy for admin users to insert bookings on behalf of tourists
CREATE POLICY "Admins can insert driver bookings" 
ON public.driver_bookings 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.admin_users 
  WHERE user_id = auth.uid() AND is_active = true
));