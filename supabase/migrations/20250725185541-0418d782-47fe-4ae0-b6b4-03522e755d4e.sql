-- Fix RLS policies for guides table to allow admin updates
DROP POLICY IF EXISTS "Allow guide reading" ON public.guides;
DROP POLICY IF EXISTS "Allow guide creation" ON public.guides;
DROP POLICY IF EXISTS "Guides can update their own profile" ON public.guides;
DROP POLICY IF EXISTS "Guides can view their own profile" ON public.guides;

-- Create comprehensive admin-friendly policies
CREATE POLICY "Enable read access for guides" 
ON public.guides FOR SELECT 
USING (true);

CREATE POLICY "Enable insert access for guides" 
ON public.guides FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Enable update access for guides" 
ON public.guides FOR UPDATE 
USING (true);

CREATE POLICY "Enable delete access for guides" 
ON public.guides FOR DELETE 
USING (true);