-- Add RLS policy to allow guides to view tourist profiles when they have assignments
CREATE POLICY "Guides can view tourist profiles for assignments" 
ON public.profiles 
FOR SELECT 
USING (
  user_type = 'tourist' 
  AND EXISTS (
    SELECT 1 FROM public.guides g 
    WHERE g.guide_id = current_setting('app.current_guide_id', true)
  )
);