-- Complete fix for admin RLS recursion and enhance guides table for comprehensive editing
-- 1. Create security definer function to safely check admin status
CREATE OR REPLACE FUNCTION public.check_admin_role(user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE admin_users.user_id = check_admin_role.user_id 
    AND is_active = true
  );
$$;

-- 2. Fix admin_users RLS policies to prevent infinite recursion
DROP POLICY IF EXISTS "Admins can manage admin users" ON public.admin_users;

CREATE POLICY "Admins can view admin users" 
ON public.admin_users 
FOR SELECT 
USING (public.check_admin_role());

CREATE POLICY "Superadmins can manage admin users" 
ON public.admin_users 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users au2 
    WHERE au2.user_id = auth.uid() 
    AND au2.is_active = true 
    AND au2.admin_role = 'superadmin'
  )
);

-- 3. Enhance guides table with new fields for comprehensive editing
ALTER TABLE public.guides 
ADD COLUMN IF NOT EXISTS languages text[] DEFAULT ARRAY['English']::text[],
ADD COLUMN IF NOT EXISTS availability_status text DEFAULT 'available' CHECK (availability_status IN ('available', 'busy', 'offline')),
ADD COLUMN IF NOT EXISTS hourly_rate numeric(10,2) DEFAULT 50.00,
ADD COLUMN IF NOT EXISTS bio text,
ADD COLUMN IF NOT EXISTS experience_years integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS certifications text[] DEFAULT ARRAY[]::text[],
ADD COLUMN IF NOT EXISTS location text DEFAULT 'AlUla';

-- 4. Update existing guides to have default languages and data
UPDATE public.guides 
SET 
  languages = ARRAY['English', 'Arabic']::text[],
  availability_status = COALESCE(availability_status, 'available'),
  hourly_rate = COALESCE(hourly_rate, 50.00),
  experience_years = COALESCE(experience_years, 2),
  certifications = COALESCE(certifications, ARRAY['AlUla Heritage Guide']::text[]),
  location = COALESCE(location, 'AlUla')
WHERE languages IS NULL OR array_length(languages, 1) IS NULL;

-- 5. Fix guides table RLS policies
DROP POLICY IF EXISTS "Admins can manage guides" ON public.guides;
DROP POLICY IF EXISTS "Allow guide creation" ON public.guides;
DROP POLICY IF EXISTS "Allow guide reading" ON public.guides;
DROP POLICY IF EXISTS "Guides can update their own profile" ON public.guides;
DROP POLICY IF EXISTS "Guides can view their own profile" ON public.guides;
DROP POLICY IF EXISTS "Everyone can view guides" ON public.guides;

CREATE POLICY "Everyone can view guides" 
ON public.guides 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage guides" 
ON public.guides 
FOR ALL 
USING (public.check_admin_role());

CREATE POLICY "Guides can update their own profile" 
ON public.guides 
FOR UPDATE 
USING (guide_id = current_setting('app.current_guide_id'::text, true));

-- 6. Fix packages table RLS policy
DROP POLICY IF EXISTS "Admins can manage packages" ON public.packages;
DROP POLICY IF EXISTS "Guides can manage packages" ON public.packages;

CREATE POLICY "Admins can manage packages" 
ON public.packages 
FOR ALL 
USING (public.check_admin_role());

CREATE POLICY "Everyone can view active packages" 
ON public.packages 
FOR SELECT 
USING (status = 'active');

-- 7. Create performance indexes
CREATE INDEX IF NOT EXISTS idx_guides_languages ON public.guides USING GIN(languages);
CREATE INDEX IF NOT EXISTS idx_guides_availability ON public.guides(availability_status);
CREATE INDEX IF NOT EXISTS idx_guides_location ON public.guides(location);

-- 8. Enable realtime for guides table
ALTER publication supabase_realtime ADD TABLE public.guides;
ALTER TABLE public.guides REPLICA IDENTITY FULL;