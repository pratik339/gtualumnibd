-- Add funding type and joining year columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN funding_type text DEFAULT 'iccr' CHECK (funding_type IN ('iccr', 'self_funded')),
ADD COLUMN joining_year integer;