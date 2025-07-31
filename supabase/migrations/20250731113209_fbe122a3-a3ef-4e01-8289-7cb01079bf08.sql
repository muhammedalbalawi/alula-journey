-- Create function to set guide session variables for RLS policies
CREATE OR REPLACE FUNCTION public.set_guide_session(guide_uuid uuid, guide_identifier text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  PERFORM set_config('app.current_guide_uuid', guide_uuid::text, false);
  PERFORM set_config('app.current_guide_id', guide_identifier, false);
END;
$$;