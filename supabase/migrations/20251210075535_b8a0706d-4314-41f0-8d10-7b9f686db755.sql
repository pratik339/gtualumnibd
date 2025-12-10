-- Create a secure view that respects privacy settings for contact information
CREATE OR REPLACE VIEW public.profiles_secure AS
SELECT 
  p.id,
  p.user_id,
  p.full_name,
  p.photo_url,
  p.user_type,
  p.status,
  p.college_id,
  p.branch_id,
  p.high_commission_id,
  p.passout_year,
  p.current_semester,
  p.expected_passout_year,
  p.scholarship_year,
  p.achievements,
  p.experience,
  p.job_title,
  p.company,
  p.location_city,
  p.location_country,
  p.created_at,
  p.updated_at,
  -- Only show contact info if visible flag is true OR user is viewing their own profile OR user is admin
  CASE 
    WHEN p.email_visible = true OR p.user_id = auth.uid() OR has_role(auth.uid(), 'admin') 
    THEN p.email 
    ELSE NULL 
  END as email,
  CASE 
    WHEN p.linkedin_visible = true OR p.user_id = auth.uid() OR has_role(auth.uid(), 'admin') 
    THEN p.linkedin_url 
    ELSE NULL 
  END as linkedin_url,
  CASE 
    WHEN p.whatsapp_visible = true OR p.user_id = auth.uid() OR has_role(auth.uid(), 'admin') 
    THEN p.whatsapp_number 
    ELSE NULL 
  END as whatsapp_number,
  CASE 
    WHEN p.facebook_visible = true OR p.user_id = auth.uid() OR has_role(auth.uid(), 'admin') 
    THEN p.facebook_url 
    ELSE NULL 
  END as facebook_url,
  -- Only show enrollment number to owner and admins
  CASE 
    WHEN p.user_id = auth.uid() OR has_role(auth.uid(), 'admin') 
    THEN p.enrollment_number 
    ELSE NULL 
  END as enrollment_number,
  -- Include visibility flags for UI rendering
  p.email_visible,
  p.linkedin_visible,
  p.whatsapp_visible,
  p.facebook_visible
FROM public.profiles p;

-- Grant access to authenticated users
GRANT SELECT ON public.profiles_secure TO authenticated;