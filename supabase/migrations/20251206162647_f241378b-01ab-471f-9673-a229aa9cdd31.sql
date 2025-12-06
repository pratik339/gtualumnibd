-- Create enum for user types
CREATE TYPE public.user_type AS ENUM ('alumni', 'scholar');

-- Create enum for approval status
CREATE TYPE public.approval_status AS ENUM ('pending', 'approved', 'rejected');

-- Create enum for app roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create colleges table
CREATE TABLE public.colleges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  city TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create branches table
CREATE TABLE public.branches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  code TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create high_commissions table
CREATE TABLE public.high_commissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  country TEXT,
  type TEXT DEFAULT 'international',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  photo_url TEXT,
  user_type public.user_type NOT NULL,
  status public.approval_status NOT NULL DEFAULT 'pending',
  
  -- Academic info
  college_id UUID REFERENCES public.colleges(id),
  branch_id UUID REFERENCES public.branches(id),
  passout_year INTEGER,
  current_semester INTEGER,
  expected_passout_year INTEGER,
  
  -- Scholarship info
  scholarship_year INTEGER,
  high_commission_id UUID REFERENCES public.high_commissions(id),
  
  -- Experience and achievements
  achievements TEXT,
  experience TEXT,
  
  -- Current status (for alumni)
  job_title TEXT,
  company TEXT,
  location_city TEXT,
  location_country TEXT,
  
  -- Contact options with visibility toggles
  linkedin_url TEXT,
  linkedin_visible BOOLEAN DEFAULT true,
  whatsapp_number TEXT,
  whatsapp_visible BOOLEAN DEFAULT true,
  facebook_url TEXT,
  facebook_visible BOOLEAN DEFAULT true,
  email TEXT,
  email_visible BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(user_id)
);

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Enable RLS on all tables
ALTER TABLE public.colleges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.high_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for profiles timestamp updates
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies for colleges (readable by all authenticated, writable by admin)
CREATE POLICY "Colleges are viewable by authenticated users"
ON public.colleges FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can manage colleges"
ON public.colleges FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for branches
CREATE POLICY "Branches are viewable by authenticated users"
ON public.branches FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can manage branches"
ON public.branches FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for high_commissions
CREATE POLICY "High commissions are viewable by authenticated users"
ON public.high_commissions FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can manage high commissions"
ON public.high_commissions FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for profiles
CREATE POLICY "Users can view approved profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (status = 'approved' OR user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create their own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
WITH CHECK (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete profiles"
ON public.profiles FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for user_roles (only admins can view/manage)
CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR user_id = auth.uid());

CREATE POLICY "Admins can manage roles"
ON public.user_roles FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Insert some default data
INSERT INTO public.branches (name, code) VALUES
('Computer Engineering', 'CE'),
('Information Technology', 'IT'),
('Electronics & Communication', 'EC'),
('Mechanical Engineering', 'ME'),
('Civil Engineering', 'CIV'),
('Electrical Engineering', 'EE'),
('Chemical Engineering', 'CH'),
('Automobile Engineering', 'AU');

INSERT INTO public.high_commissions (name, country, type) VALUES
('British Council', 'United Kingdom', 'international'),
('USIEF (Fulbright)', 'United States', 'international'),
('DAAD', 'Germany', 'international'),
('Campus France', 'France', 'international'),
('Australia Awards', 'Australia', 'international'),
('Gujarat State Scholarship', 'India', 'state'),
('Central Government Scholarship', 'India', 'central');

-- Create storage bucket for profile photos
INSERT INTO storage.buckets (id, name, public) VALUES ('profile-photos', 'profile-photos', true);

-- Storage policies for profile photos
CREATE POLICY "Anyone can view profile photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-photos');

CREATE POLICY "Authenticated users can upload profile photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'profile-photos');

CREATE POLICY "Users can update their own photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'profile-photos');

CREATE POLICY "Users can delete their own photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'profile-photos');