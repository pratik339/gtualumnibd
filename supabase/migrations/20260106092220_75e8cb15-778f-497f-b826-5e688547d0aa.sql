-- Fix: User Privacy Settings Bypassed via Direct Table Access
-- This prevents authenticated users from directly querying the profiles table,
-- forcing them to use profiles_secure view which respects visibility flags.

-- First, drop the existing SELECT policy that allows all authenticated users to read approved profiles
DROP POLICY IF EXISTS "Users can view approved profiles" ON public.profiles;

-- Create new SELECT policy that restricts profiles table access to:
-- 1. The profile owner (can always see their own profile)
-- 2. Admins (can see all profiles for management)
-- Regular authenticated users can NO longer directly SELECT from profiles table
CREATE POLICY "Users can only view own profile or admins can view all"
ON public.profiles
FOR SELECT
USING (
  user_id = auth.uid() OR 
  public.has_role(auth.uid(), 'admin')
);

-- Grant SELECT on profiles_secure view to authenticated users
-- This ensures they can still read profiles via the privacy-respecting view
GRANT SELECT ON public.profiles_secure TO authenticated;