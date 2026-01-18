-- Add present and permanent address columns to registrations table
ALTER TABLE public.registrations 
ADD COLUMN present_address text,
ADD COLUMN present_city text,
ADD COLUMN present_district text,
ADD COLUMN present_state text,
ADD COLUMN present_pincode text,
ADD COLUMN permanent_address text,
ADD COLUMN permanent_city text,
ADD COLUMN permanent_district text,
ADD COLUMN permanent_state text,
ADD COLUMN permanent_pincode text,
ADD COLUMN same_as_present boolean DEFAULT false;

-- Drop the old address columns that will be replaced
ALTER TABLE public.registrations 
DROP COLUMN IF EXISTS full_address,
DROP COLUMN IF EXISTS city,
DROP COLUMN IF EXISTS district,
DROP COLUMN IF EXISTS state,
DROP COLUMN IF EXISTS pincode;

-- Create storage policies for member-photos bucket
CREATE POLICY "Anyone can upload photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'member-photos');

CREATE POLICY "Anyone can view photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'member-photos');

CREATE POLICY "Admins can delete photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'member-photos' 
  AND EXISTS (
    SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()
  )
);