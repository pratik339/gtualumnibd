-- Create a function to validate text field lengths
CREATE OR REPLACE FUNCTION public.validate_profile_text_lengths()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Validate full_name (required, max 100 chars)
  IF NEW.full_name IS NULL OR char_length(NEW.full_name) = 0 THEN
    RAISE EXCEPTION 'Full name is required';
  END IF;
  IF char_length(NEW.full_name) > 100 THEN
    RAISE EXCEPTION 'Full name must be less than 100 characters';
  END IF;

  -- Validate job_title (max 200 chars)
  IF NEW.job_title IS NOT NULL AND char_length(NEW.job_title) > 200 THEN
    RAISE EXCEPTION 'Job title must be less than 200 characters';
  END IF;

  -- Validate company (max 200 chars)
  IF NEW.company IS NOT NULL AND char_length(NEW.company) > 200 THEN
    RAISE EXCEPTION 'Company must be less than 200 characters';
  END IF;

  -- Validate location_city (max 100 chars)
  IF NEW.location_city IS NOT NULL AND char_length(NEW.location_city) > 100 THEN
    RAISE EXCEPTION 'City must be less than 100 characters';
  END IF;

  -- Validate location_country (max 100 chars)
  IF NEW.location_country IS NOT NULL AND char_length(NEW.location_country) > 100 THEN
    RAISE EXCEPTION 'Country must be less than 100 characters';
  END IF;

  -- Validate achievements (max 5000 chars)
  IF NEW.achievements IS NOT NULL AND char_length(NEW.achievements) > 5000 THEN
    RAISE EXCEPTION 'Achievements must be less than 5000 characters';
  END IF;

  -- Validate experience (max 5000 chars)
  IF NEW.experience IS NOT NULL AND char_length(NEW.experience) > 5000 THEN
    RAISE EXCEPTION 'Experience must be less than 5000 characters';
  END IF;

  -- Validate projects (max 5000 chars)
  IF NEW.projects IS NOT NULL AND char_length(NEW.projects) > 5000 THEN
    RAISE EXCEPTION 'Projects must be less than 5000 characters';
  END IF;

  -- Validate enrollment_number (max 50 chars)
  IF NEW.enrollment_number IS NOT NULL AND char_length(NEW.enrollment_number) > 50 THEN
    RAISE EXCEPTION 'Enrollment number must be less than 50 characters';
  END IF;

  -- Validate rejection_reason (max 2000 chars)
  IF NEW.rejection_reason IS NOT NULL AND char_length(NEW.rejection_reason) > 2000 THEN
    RAISE EXCEPTION 'Rejection reason must be less than 2000 characters';
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger to validate before insert or update
DROP TRIGGER IF EXISTS validate_profile_text_lengths_trigger ON public.profiles;
CREATE TRIGGER validate_profile_text_lengths_trigger
BEFORE INSERT OR UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.validate_profile_text_lengths();