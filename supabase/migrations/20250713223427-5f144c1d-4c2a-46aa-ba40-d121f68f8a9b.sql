-- Fix Issue 1: Function Search Path Security
-- Set secure search_path for all functions to prevent search path manipulation attacks

-- Fix handle_new_user function
ALTER FUNCTION public.handle_new_user() SET search_path = '';

-- Fix update_updated_at_column function  
ALTER FUNCTION public.update_updated_at_column() SET search_path = '';

-- Fix create_tour_assignment_on_approval function
ALTER FUNCTION public.create_tour_assignment_on_approval() SET search_path = '';

-- Recreate functions with explicit schema references for additional security
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  INSERT INTO public.profiles (id, full_name, user_type)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'tourist')
  );
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.create_tour_assignment_on_approval()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  -- Only create assignment when status changes to 'approved' and guide is assigned
  IF NEW.status = 'approved' AND NEW.assigned_guide_id IS NOT NULL AND 
     (OLD.status IS NULL OR OLD.status != 'approved') THEN
    
    -- Check if assignment already exists to avoid duplicates
    IF NOT EXISTS (
      SELECT 1 FROM public.tour_assignments 
      WHERE tourist_id = NEW.tourist_id 
      AND guide_id = NEW.assigned_guide_id 
      AND status IN ('pending', 'active')
    ) THEN
      INSERT INTO public.tour_assignments (
        tourist_id,
        guide_id,
        tour_name,
        start_date,
        status
      ) VALUES (
        NEW.tourist_id,
        NEW.assigned_guide_id,
        'AlUla Heritage Tour',
        CURRENT_DATE + INTERVAL '1 day',
        'active'
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;