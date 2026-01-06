-- Allow authenticated users to add new branches (like colleges)
CREATE POLICY "Authenticated users can add branches"
ON public.branches
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);