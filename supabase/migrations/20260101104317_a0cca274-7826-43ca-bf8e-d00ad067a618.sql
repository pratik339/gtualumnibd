-- Allow authenticated users to insert new colleges
CREATE POLICY "Authenticated users can add colleges" 
ON public.colleges 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);