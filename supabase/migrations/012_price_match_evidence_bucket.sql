-- Create storage bucket for price match evidence files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'price-match-evidence',
  'price-match-evidence',
  true,
  10485760, -- 10 MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Brokers can upload files under their own user-id folder
CREATE POLICY "price_match_evidence_insert_own"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'price-match-evidence'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Anyone authenticated can read (evidence URLs are shared with superadmin)
CREATE POLICY "price_match_evidence_select"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'price-match-evidence');

-- Brokers can delete their own files (re-upload scenario)
CREATE POLICY "price_match_evidence_delete_own"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'price-match-evidence'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
