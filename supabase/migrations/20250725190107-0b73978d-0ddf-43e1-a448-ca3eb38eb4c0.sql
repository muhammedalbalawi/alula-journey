-- Fix RLS policies for packages table to allow proper creation and updates
DROP POLICY IF EXISTS "Enable admin access for packages" ON public.packages;
DROP POLICY IF EXISTS "Everyone can view active packages" ON public.packages;
DROP POLICY IF EXISTS "Guides can manage packages" ON public.packages;

-- Create new comprehensive policies for packages
CREATE POLICY "Enable read access for packages" 
ON public.packages FOR SELECT 
USING (true);

CREATE POLICY "Enable insert access for packages" 
ON public.packages FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Enable update access for packages" 
ON public.packages FOR UPDATE 
USING (true);

CREATE POLICY "Enable delete access for packages" 
ON public.packages FOR DELETE 
USING (true);

-- Add created_by column for tracking
ALTER TABLE public.packages ADD COLUMN IF NOT EXISTS created_by uuid DEFAULT auth.uid();

-- Ensure realtime is enabled for packages
ALTER TABLE public.packages REPLICA IDENTITY FULL;