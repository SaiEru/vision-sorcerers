
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('hospital-videos', 'hospital-videos', false, 20971520, ARRAY['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo']);

CREATE POLICY "Admin can upload videos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'hospital-videos' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can read videos"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'hospital-videos' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can delete videos"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'hospital-videos' AND public.has_role(auth.uid(), 'admin'));
