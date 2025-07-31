-- Create function to set guide session variables
CREATE OR REPLACE FUNCTION public.set_guide_session(guide_uuid UUID, guide_identifier TEXT)
RETURNS VOID AS $$
BEGIN
  PERFORM set_config('app.current_guide_id', guide_identifier, true);
  PERFORM set_config('app.current_guide_uuid', guide_uuid::TEXT, true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the previous policy that might not work
DROP POLICY IF EXISTS "Guides can view tourist profiles for assignments" ON public.profiles;

-- Create a better policy that allows guides to view all tourist profiles
CREATE POLICY "Guides can view all tourist profiles" 
ON public.profiles 
FOR SELECT 
USING (
  user_type = 'tourist' 
  OR auth.uid() = id
);