-- Fix 5: Remove security definer view and improve access control
-- Drop the security definer view and replace with proper RLS policies

-- Drop the security definer view that was flagged
DROP VIEW IF EXISTS public.tour_assignments_view;

-- Create a security definer function for admin checks to prevent RLS recursion
CREATE OR REPLACE FUNCTION public.is_verified_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = auth.uid() AND is_active = true
  );
$$;

-- Enhance rate limiting with proper authentication tracking
CREATE OR REPLACE FUNCTION public.record_auth_attempt(user_identifier text, attempt_type_param text, success boolean DEFAULT false)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  current_record RECORD;
  max_attempts INTEGER := 5;
  lockout_duration INTERVAL := interval '15 minutes';
BEGIN
  -- Get current window record
  SELECT * INTO current_record
  FROM public.auth_rate_limit
  WHERE identifier = user_identifier 
    AND attempt_type = attempt_type_param
    AND window_start > now() - interval '15 minutes'
  ORDER BY window_start DESC
  LIMIT 1;
  
  IF current_record IS NOT NULL THEN
    -- Update existing record
    UPDATE public.auth_rate_limit
    SET attempts = CASE 
      WHEN success THEN 0 
      ELSE attempts + 1 
    END,
    blocked_until = CASE 
      WHEN success THEN NULL
      WHEN attempts + 1 >= max_attempts THEN now() + lockout_duration
      ELSE blocked_until
    END
    WHERE id = current_record.id;
  ELSE
    -- Create new record
    INSERT INTO public.auth_rate_limit (identifier, attempt_type, attempts, blocked_until)
    VALUES (
      user_identifier, 
      attempt_type_param, 
      CASE WHEN success THEN 0 ELSE 1 END,
      CASE WHEN NOT success AND 1 >= max_attempts THEN now() + lockout_duration ELSE NULL END
    );
  END IF;
  
  -- Log security event
  INSERT INTO public.admin_audit_log (admin_user_id, action, details)
  VALUES (
    auth.uid(),
    'auth_attempt',
    jsonb_build_object(
      'identifier', user_identifier,
      'attempt_type', attempt_type_param,
      'success', success,
      'timestamp', now()
    )
  );
END;
$function$;