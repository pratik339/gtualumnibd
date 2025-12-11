-- Add rejection_reason column to profiles table
ALTER TABLE public.profiles ADD COLUMN rejection_reason TEXT;

-- Update the profiles_secure view to include rejection_reason
DROP VIEW IF EXISTS public.profiles_secure;

CREATE VIEW public.profiles_secure 
WITH (security_invoker = true) 
AS SELECT
  p.id,
  p.user_id,
  p.full_name,
  p.photo_url,
  p.user_type,
  p.status,
  p.rejection_reason,
  p.college_id,
  p.branch_id,
  p.high_commission_id,
  p.passout_year,
  p.current_semester,
  p.expected_passout_year,
  p.scholarship_year,
  p.job_title,
  p.company,
  p.location_city,
  p.location_country,
  p.achievements,
  p.experience,
  p.created_at,
  p.updated_at,
  CASE WHEN p.email_visible = true THEN p.email ELSE NULL END AS email,
  CASE WHEN p.linkedin_visible = true THEN p.linkedin_url ELSE NULL END AS linkedin_url,
  CASE WHEN p.whatsapp_visible = true THEN p.whatsapp_number ELSE NULL END AS whatsapp_number,
  CASE WHEN p.facebook_visible = true THEN p.facebook_url ELSE NULL END AS facebook_url,
  CASE WHEN p.email_visible = true THEN p.enrollment_number ELSE NULL END AS enrollment_number,
  p.email_visible,
  p.linkedin_visible,
  p.whatsapp_visible,
  p.facebook_visible
FROM public.profiles p
WHERE p.status = 'approved' 
   OR p.user_id = auth.uid() 
   OR public.has_role(auth.uid(), 'admin');