-- Fix infinite recursion in admin_users RLS policy and enhance guides table
-- 1. First, create a security definer function to check admin status safely
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE admin_users.user_id = is_admin.user_id 
    AND is_active = true
  );
$$;

-- 2. Drop existing problematic RLS policies on admin_users
DROP POLICY IF EXISTS "Admins can manage admin users" ON public.admin_users;

-- 3. Create new safe RLS policies for admin_users
CREATE POLICY "Admins can view admin users" 
ON public.admin_users 
FOR SELECT 
USING (public.is_admin());

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

-- 4. Add languages field to guides table and enhance it
ALTER TABLE public.guides 
ADD COLUMN IF NOT EXISTS languages text[] DEFAULT ARRAY['English']::text[],
ADD COLUMN IF NOT EXISTS availability_status text DEFAULT 'available' CHECK (availability_status IN ('available', 'busy', 'offline')),
ADD COLUMN IF NOT EXISTS hourly_rate numeric(10,2),
ADD COLUMN IF NOT EXISTS bio text,
ADD COLUMN IF NOT EXISTS experience_years integer,
ADD COLUMN IF NOT EXISTS certifications text[];

-- 5. Update existing guides to have default languages if null
UPDATE public.guides 
SET languages = ARRAY['English']::text[] 
WHERE languages IS NULL OR array_length(languages, 1) IS NULL;

-- 6. Create/update RLS policies for guides using the safe function
DROP POLICY IF EXISTS "Admins can manage guides" ON public.guides;
DROP POLICY IF EXISTS "Allow guide creation" ON public.guides;
DROP POLICY IF EXISTS "Allow guide reading" ON public.guides;

CREATE POLICY "Everyone can view guides" 
ON public.guides 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage guides" 
ON public.guides 
FOR ALL 
USING (public.is_admin());

CREATE POLICY "Guides can update their own profile" 
ON public.guides 
FOR UPDATE 
USING (guide_id = current_setting('app.current_guide_id'::text, true));

-- 7. Fix packages table RLS policy issue
DROP POLICY IF EXISTS "Admins can manage packages" ON public.packages;

CREATE POLICY "Admins can manage packages" 
ON public.packages 
FOR ALL 
USING (public.is_admin());

-- 8. Create index for better performance
CREATE INDEX IF NOT EXISTS idx_guides_languages ON public.guides USING GIN(languages);
CREATE INDEX IF NOT EXISTS idx_guides_availability ON public.guides(availability_status);

-- 9. Create function to update guide rating
CREATE OR REPLACE FUNCTION public.update_guide_rating()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.guides 
  SET rating = (
    SELECT COALESCE(AVG(rating), 0) 
    FROM public.guide_ratings 
    WHERE guide_id = NEW.guide_id
  )
  WHERE id = NEW.guide_id;
  
  RETURN NEW;
END;
$$;

-- 10. Create trigger to automatically update guide rating
DROP TRIGGER IF EXISTS update_guide_rating_trigger ON public.guide_ratings;
CREATE TRIGGER update_guide_rating_trigger
  AFTER INSERT OR UPDATE OR DELETE
  ON public.guide_ratings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_guide_rating();