-- Fix the remaining RLS policy issue for guides (without duplicate)
-- Drop existing problematic policy first
DROP POLICY IF EXISTS "Guides can update their own profile" ON public.guides;

-- Create new safe RLS policies for guides
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

-- Ensure realtime is enabled for guides table
ALTER publication supabase_realtime ADD TABLE public.guides;
ALTER TABLE public.guides REPLICA IDENTITY FULL;