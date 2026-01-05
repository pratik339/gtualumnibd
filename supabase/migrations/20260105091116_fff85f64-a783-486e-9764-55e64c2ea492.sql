-- Fix 1: Create trigger to prevent users from self-approving profiles
CREATE OR REPLACE FUNCTION public.validate_profile_update()
RETURNS TRIGGER AS $$
BEGIN
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS enforce_profile_update_rules ON public.profiles;

-- Add trigger
CREATE TRIGGER enforce_profile_update_rules
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.validate_profile_update();

-- Fix 2: Update profiles_secure view to properly restrict enrollment_number visibility
DROP VIEW IF EXISTS public.profiles_secure;

CREATE VIEW public.profiles_secure 
WITH (security_invoker = true) 
AS SELECT
  p.id,
  p.user_id,
  p.user_type,
  p.status,
  p.college_id,
  p.branch_id,
  p.high_commission_id,
  p.passout_year,
  p.current_semester,
  p.expected_passout_year,
  p.scholarship_year,
  p.full_name,
  p.photo_url,
  p.job_title,
  p.company,
  p.location_city,
  p.location_country,
  p.achievements,
  p.experience,
  p.created_at,
  p.updated_at,
  p.rejection_reason,
  p.email_visible,
  p.linkedin_visible,
  p.whatsapp_visible,
  p.facebook_visible,
  -- Privacy-controlled fields based on visibility flags
  CASE WHEN p.email_visible = true OR p.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin') 
    THEN p.email ELSE NULL END AS email,
  CASE WHEN p.linkedin_visible = true OR p.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin') 
    THEN p.linkedin_url ELSE NULL END AS linkedin_url,
  CASE WHEN p.whatsapp_visible = true OR p.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin') 
    THEN p.whatsapp_number ELSE NULL END AS whatsapp_number,
  CASE WHEN p.facebook_visible = true OR p.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin') 
    THEN p.facebook_url ELSE NULL END AS facebook_url,
  -- Enrollment number only visible to owner and admins (not controlled by email_visible)
  CASE WHEN p.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin') 
    THEN p.enrollment_number ELSE NULL END AS enrollment_number
FROM public.profiles p
WHERE p.status = 'approved' 
   OR p.user_id = auth.uid() 
   OR public.has_role(auth.uid(), 'admin');