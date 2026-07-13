
-- Restrict SECURITY DEFINER functions from being called by clients directly
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- Tighten application insert policy: require basic fields to be present
DROP POLICY IF EXISTS "anyone can insert applications" ON public.applications;
CREATE POLICY "anyone can insert applications" ON public.applications
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    length(trim(full_name)) > 1
    AND email ~* '^[^@]+@[^@]+\.[^@]+$'
    AND length(trim(phone)) >= 6
    AND length(trim(cv_path)) > 0
    AND length(trim(job_id)) > 0
  );

-- Tighten profile insert to only allow inserting own row (already true, but explicit)
DROP POLICY IF EXISTS "own profile upsert" ON public.profiles;
CREATE POLICY "own profile upsert" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id AND id IS NOT NULL);

-- Storage policies: allow anon uploads to cvs bucket (into 'incoming/' prefix), only admins read
CREATE POLICY "public can upload cvs" ON storage.objects
  FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'cvs' AND (storage.foldername(name))[1] = 'incoming');

CREATE POLICY "admins read cvs" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'cvs' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admins delete cvs" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'cvs' AND public.has_role(auth.uid(), 'admin'));
