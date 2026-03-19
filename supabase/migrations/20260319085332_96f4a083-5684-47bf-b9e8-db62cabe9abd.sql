
-- Create the hospital-videos storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('hospital-videos', 'hospital-videos', false, 20971520, ARRAY['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'])
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload videos
CREATE POLICY "Authenticated users can upload videos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'hospital-videos');

-- Allow authenticated users to read videos
CREATE POLICY "Authenticated users can read videos"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'hospital-videos');

-- Allow service role to manage videos (for edge functions)
CREATE POLICY "Service role can manage videos"
ON storage.objects FOR ALL
TO service_role
USING (bucket_id = 'hospital-videos');
