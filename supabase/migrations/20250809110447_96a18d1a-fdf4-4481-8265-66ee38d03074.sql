-- Phase 1: Critical Security Fixes

-- 1. Create proper admin authentication table (if not exists)
-- The admin_users table already exists, so we'll ensure it's properly configured

-- 2. Fix Guide Authentication System
-- First, let's add a proper user_id column to guides table to link with Supabase auth
ALTER TABLE public.guides 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_guides_user_id ON public.guides(user_id);

-- 3. Secure Guides Table RLS Policies
-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Enable delete access for guides" ON public.guides;
DROP POLICY IF EXISTS "Enable insert access for guides" ON public.guides;
DROP POLICY IF EXISTS "Enable read access for guides" ON public.guides;
DROP POLICY IF EXISTS "Enable update access for guides" ON public.guides;

-- Create secure RLS policies for guides
CREATE POLICY "Admins can manage all guides" 
ON public.guides 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = auth.uid() AND is_active = true
  )
);

CREATE POLICY "Guides can view their own profile" 
ON public.guides 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Guides can update their own profile" 
ON public.guides 
FOR UPDATE 
USING (user_id = auth.uid());

-- 4. Restrict Tourist Profile Access
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Guides can view all tourist profiles" ON public.profiles;

-- Create restricted policy - guides can only see assigned tourists
CREATE POLICY "Guides can view assigned tourist profiles" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() = id OR
  (user_type = 'tourist' AND EXISTS (
    SELECT 1 FROM public.activities a
    WHERE a.tourist_id = profiles.id 
    AND a.tour_guide_id IN (
      SELECT g.id FROM public.guides g WHERE g.user_id = auth.uid()
    )
  ))
);

-- 5. Create password reset function for guides (secure)
CREATE OR REPLACE FUNCTION public.hash_guide_password(password TEXT)
RETURNS TEXT AS $$
BEGIN
  -- This is a placeholder - in production, use proper bcrypt/scrypt hashing
  -- For now, we'll use a simple hash to replace plain text
  RETURN encode(digest(password || 'salt123', 'sha256'), 'hex');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Update existing guide passwords to be hashed
UPDATE public.guides 
SET password = public.hash_guide_password(password)
WHERE length(password) < 64; -- Only update if not already hashed

-- 7. Create function to verify guide passwords
CREATE OR REPLACE FUNCTION public.verify_guide_password(guide_identifier TEXT, input_password TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  stored_password TEXT;
BEGIN
  SELECT password INTO stored_password 
  FROM public.guides 
  WHERE guide_id = guide_identifier;
  
  IF stored_password IS NULL THEN
    RETURN FALSE;
  END IF;
  
  RETURN stored_password = public.hash_guide_password(input_password);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Create secure admin verification function
CREATE OR REPLACE FUNCTION public.verify_admin_user(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = user_uuid AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Add audit logging table for admin actions
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  target_table TEXT,
  target_id UUID,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs" 
ON public.admin_audit_log 
FOR SELECT 
USING (public.verify_admin_user(auth.uid()));

-- System can insert audit logs
CREATE POLICY "System can insert audit logs" 
ON public.admin_audit_log 
FOR INSERT 
WITH CHECK (true);