-- Allow authenticated users to view approved profiles (for directory/profile view)
CREATE POLICY "Authenticated users can view approved profiles"
ON public.profiles
FOR SELECT
USING (
  (status = 'approved' AND auth.uid() IS NOT NULL)
  OR user_id = auth.uid()
  OR has_role(auth.uid(), 'admin'::app_role)
);