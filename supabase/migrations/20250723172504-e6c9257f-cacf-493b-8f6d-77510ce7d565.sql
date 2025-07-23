-- Final cleanup for guides and packages policies
-- Fix packages policies without conflicts
DROP POLICY IF EXISTS "Everyone can view active packages" ON public.packages;
DROP POLICY IF EXISTS "Admins can manage packages" ON public.packages;

CREATE POLICY "Everyone can view active packages" 
ON public.packages 
FOR SELECT 
USING (status = 'active');

CREATE POLICY "Admins can manage packages" 
ON public.packages 
FOR ALL 
USING (public.check_admin_role());

-- Ensure guides table has realtime enabled
ALTER publication supabase_realtime ADD TABLE public.guides;