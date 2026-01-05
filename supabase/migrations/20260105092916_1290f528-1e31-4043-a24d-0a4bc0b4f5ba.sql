-- Add projects column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN projects text;

-- Update profiles_secure view to include projects
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
  p.projects,
  p.created_at,
  p.updated_at,
  p.rejection_reason,
  p.email_visible,
  p.linkedin_visible,
  p.whatsapp_visible,
  p.facebook_visible,
  CASE WHEN p.email_visible = true OR p.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin') 
    THEN p.email ELSE NULL END AS email,
  CASE WHEN p.linkedin_visible = true OR p.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin') 
    THEN p.linkedin_url ELSE NULL END AS linkedin_url,
  CASE WHEN p.whatsapp_visible = true OR p.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin') 
    THEN p.whatsapp_number ELSE NULL END AS whatsapp_number,
  CASE WHEN p.facebook_visible = true OR p.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin') 
    THEN p.facebook_url ELSE NULL END AS facebook_url,
  CASE WHEN p.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin') 
    THEN p.enrollment_number ELSE NULL END AS enrollment_number
FROM public.profiles p
WHERE p.status = 'approved' 
   OR p.user_id = auth.uid() 
   OR public.has_role(auth.uid(), 'admin');