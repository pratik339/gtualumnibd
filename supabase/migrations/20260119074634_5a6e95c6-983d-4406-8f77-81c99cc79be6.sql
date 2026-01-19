-- Enable pg_cron and pg_net extensions for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Grant usage on cron schema
GRANT USAGE ON SCHEMA cron TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA cron TO postgres;

-- Update the validate_profile_update function to allow service role updates for semester progression
CREATE OR REPLACE FUNCTION public.validate_profile_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Allow service role (used by edge functions) to make any changes
  -- Check if the current role is service_role or if it's an admin
  IF current_setting('request.jwt.claim.role', true) = 'service_role' THEN
    RETURN NEW;
  END IF;

  -- Users cannot change these fields on their own profile
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    -- Prevent status changes except to pending
    IF NEW.status IS DISTINCT FROM OLD.status AND NEW.status != 'pending' THEN
      RAISE EXCEPTION 'Only admins can change approval status';
    END IF;
    
    -- Prevent user_type changes
    IF NEW.user_type IS DISTINCT FROM OLD.user_type THEN
      RAISE EXCEPTION 'User type cannot be changed';
    END IF;
    
    -- Prevent user_id changes
    IF NEW.user_id IS DISTINCT FROM OLD.user_id THEN
      RAISE EXCEPTION 'User ID cannot be changed';
    END IF;
    
    -- Clear rejection_reason when user updates (auto-resets on edit)
    NEW.rejection_reason := NULL;
    
    -- Force status to pending on any user update
    NEW.status := 'pending';
  END IF;
  
  RETURN NEW;
END;
$function$;