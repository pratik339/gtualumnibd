-- Create a secure public function to get aggregate stats without exposing individual profile data
CREATE OR REPLACE FUNCTION public.get_public_stats()
RETURNS json
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT json_build_object(
    'total_count', COUNT(*),
    'alumni_count', COUNT(*) FILTER (WHERE user_type = 'alumni'),
    'student_count', COUNT(*) FILTER (WHERE user_type IN ('scholar', 'student')),
    'countries_count', COUNT(DISTINCT location_country) FILTER (WHERE location_country IS NOT NULL)
  )
  FROM profiles
  WHERE status = 'approved';
$$;

-- Grant execute permission to anonymous users so unauthenticated visitors can see stats
GRANT EXECUTE ON FUNCTION public.get_public_stats() TO anon;
GRANT EXECUTE ON FUNCTION public.get_public_stats() TO authenticated;