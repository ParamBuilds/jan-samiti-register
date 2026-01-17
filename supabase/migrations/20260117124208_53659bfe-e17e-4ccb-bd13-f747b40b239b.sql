-- Create registrations table with all required fields
CREATE TABLE public.registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  mobile TEXT NOT NULL,
  email TEXT NOT NULL,
  aadhaar TEXT NOT NULL,
  photo_url TEXT,
  full_address TEXT NOT NULL,
  city TEXT NOT NULL,
  district TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  location_link TEXT,
  has_vehicle BOOLEAN NOT NULL DEFAULT false,
  vehicle_types TEXT[],
  education TEXT NOT NULL,
  application_id TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- Create admin_users table for admin authentication
CREATE TABLE public.admin_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on admin_users
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to insert registrations (public form)
CREATE POLICY "Anyone can submit registration"
ON public.registrations
FOR INSERT
WITH CHECK (true);

-- Policy: Only admins can view registrations
CREATE POLICY "Admins can view all registrations"
ON public.registrations
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = auth.uid()
  )
);

-- Policy: Only admins can update registrations
CREATE POLICY "Admins can update registrations"
ON public.registrations
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = auth.uid()
  )
);

-- Policy: Only admins can delete registrations
CREATE POLICY "Admins can delete registrations"
ON public.registrations
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = auth.uid()
  )
);

-- Policy: Admin users can view their own record
CREATE POLICY "Admin users can view own record"
ON public.admin_users
FOR SELECT
USING (auth.uid() = user_id);

-- Create storage bucket for member photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('member-photos', 'member-photos', true);

-- Storage policy: Anyone can upload photos
CREATE POLICY "Anyone can upload member photos"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'member-photos');

-- Storage policy: Anyone can view photos
CREATE POLICY "Anyone can view member photos"
ON storage.objects
FOR SELECT
USING (bucket_id = 'member-photos');

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_registrations_updated_at
BEFORE UPDATE ON public.registrations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();