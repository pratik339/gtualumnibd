-- Update get_public_stats to exclude admin users from counts
CREATE OR REPLACE FUNCTION public.get_public_stats()
RETURNS json
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT json_build_object(
    'total_count', COUNT(*) FILTER (WHERE NOT EXISTS (
      SELECT 1 FROM user_roles WHERE user_roles.user_id = profiles.user_id AND role = 'admin'
    )),
    'alumni_count', COUNT(*) FILTER (WHERE user_type = 'alumni' AND NOT EXISTS (
      SELECT 1 FROM user_roles WHERE user_roles.user_id = profiles.user_id AND role = 'admin'
    )),
    'student_count', COUNT(*) FILTER (WHERE user_type IN ('scholar', 'student') AND NOT EXISTS (
      SELECT 1 FROM user_roles WHERE user_roles.user_id = profiles.user_id AND role = 'admin'
    )),
    'countries_count', COUNT(DISTINCT location_country) FILTER (WHERE location_country IS NOT NULL AND NOT EXISTS (
      SELECT 1 FROM user_roles WHERE user_roles.user_id = profiles.user_id AND role = 'admin'
    ))
  )
  FROM profiles
  WHERE status = 'approved';
$$;