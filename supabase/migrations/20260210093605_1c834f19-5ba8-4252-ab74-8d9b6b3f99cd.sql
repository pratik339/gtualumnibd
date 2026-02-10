
-- Create storage bucket for community post media
INSERT INTO storage.buckets (id, name, public) VALUES ('community-media', 'community-media', true);

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload community media"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'community-media' AND auth.uid() IS NOT NULL);

-- Allow public read access
CREATE POLICY "Community media is publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'community-media');

-- Allow users to delete their own uploads
CREATE POLICY "Users can delete their own community media"
ON storage.objects FOR DELETE
USING (bucket_id = 'community-media' AND auth.uid()::text = (storage.foldername(name))[1]);
