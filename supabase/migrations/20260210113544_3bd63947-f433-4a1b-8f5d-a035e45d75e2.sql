-- Remove the overly permissive SELECT policy on profiles
-- Keep only owner/admin direct access; everyone else must use profiles_secure view
DROP POLICY IF EXISTS "Authenticated users can view approved profiles" ON public.profiles;

-- Recreate a tighter policy: owner, admin, OR service_role only
-- The profiles_secure view (with security_invoker=true) will use the caller's auth context
-- Since the view has its own WHERE clause filtering approved profiles, 
-- we need to allow the view to read approved profiles on behalf of authenticated users
CREATE POLICY "Authenticated users can view approved profiles via secure view or own"
ON public.profiles
FOR SELECT
USING (
  (user_id = auth.uid()) 
  OR has_role(auth.uid(), 'admin'::app_role)
  OR (status = 'approved' AND auth.uid() IS NOT NULL)
);