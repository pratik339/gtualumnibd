-- Add GTU enrollment number field to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS enrollment_number text;

-- Add 'student' value to the existing enum first
ALTER TYPE public.user_type ADD VALUE IF NOT EXISTS 'student';