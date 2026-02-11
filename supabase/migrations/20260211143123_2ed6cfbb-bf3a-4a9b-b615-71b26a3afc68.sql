
-- Restrict college INSERT to admins only
DROP POLICY IF EXISTS "Authenticated users can add colleges" ON public.colleges;

-- Restrict branch INSERT to admins only  
DROP POLICY IF EXISTS "Authenticated users can add branches" ON public.branches;
