
-- 1. Document comments table
CREATE TABLE public.document_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  signed_document_id UUID NOT NULL REFERENCES public.signed_documents(id) ON DELETE CASCADE,
  assessment_id UUID NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
  author_user_id UUID NOT NULL,
  author_name TEXT NOT NULL,
  author_role TEXT NOT NULL CHECK (author_role IN ('owner','reviewer')),
  body TEXT NOT NULL,
  resolved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_document_comments_signed_doc ON public.document_comments(signed_document_id);
CREATE INDEX idx_document_comments_assessment ON public.document_comments(assessment_id);

ALTER TABLE public.document_comments ENABLE ROW LEVEL SECURITY;

-- Owner: full access on comments under assessments they own
CREATE POLICY "Owner manages comments on own assessments"
  ON public.document_comments
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.assessments a
      WHERE a.id = document_comments.assessment_id AND a.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.assessments a
      WHERE a.id = document_comments.assessment_id AND a.user_id = auth.uid()
    )
  );

-- Reviewers: read comments on workspaces they were invited to
CREATE POLICY "Reviewers read invited comments"
  ON public.document_comments
  FOR SELECT
  USING (public.is_workspace_reviewer(assessment_id, auth.uid()));

-- Reviewers: insert their own comments on invited workspaces
CREATE POLICY "Reviewers insert comments on invited workspaces"
  ON public.document_comments
  FOR INSERT
  WITH CHECK (
    public.is_workspace_reviewer(assessment_id, auth.uid())
    AND author_user_id = auth.uid()
    AND author_role = 'reviewer'
  );

-- Reviewers: update only their own comments (e.g. mark resolved)
CREATE POLICY "Reviewers update own comments"
  ON public.document_comments
  FOR UPDATE
  USING (
    public.is_workspace_reviewer(assessment_id, auth.uid())
    AND author_user_id = auth.uid()
  );

CREATE TRIGGER trg_document_comments_updated_at
  BEFORE UPDATE ON public.document_comments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. Add columns to signed_documents
ALTER TABLE public.signed_documents
  ADD COLUMN IF NOT EXISTS pdf_path TEXT,
  ADD COLUMN IF NOT EXISTS signature_image_path TEXT,
  ADD COLUMN IF NOT EXISTS reviewer_signature_image_path TEXT;

-- 3. Storage bucket for documents (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('complee-docs', 'complee-docs', false)
ON CONFLICT (id) DO NOTHING;

-- Path convention: {assessment_id}/{...}
-- Owner reviews+writes their own folder; reviewers read all + write to reviews/
CREATE POLICY "Owner reads own assessment files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'complee-docs'
    AND EXISTS (
      SELECT 1 FROM public.assessments a
      WHERE a.id::text = (storage.foldername(name))[1]
        AND a.user_id = auth.uid()
    )
  );

CREATE POLICY "Owner writes own assessment files"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'complee-docs'
    AND EXISTS (
      SELECT 1 FROM public.assessments a
      WHERE a.id::text = (storage.foldername(name))[1]
        AND a.user_id = auth.uid()
    )
  );

CREATE POLICY "Owner updates own assessment files"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'complee-docs'
    AND EXISTS (
      SELECT 1 FROM public.assessments a
      WHERE a.id::text = (storage.foldername(name))[1]
        AND a.user_id = auth.uid()
    )
  );

CREATE POLICY "Owner deletes own assessment files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'complee-docs'
    AND EXISTS (
      SELECT 1 FROM public.assessments a
      WHERE a.id::text = (storage.foldername(name))[1]
        AND a.user_id = auth.uid()
    )
  );

CREATE POLICY "Reviewers read invited assessment files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'complee-docs'
    AND public.is_workspace_reviewer(((storage.foldername(name))[1])::uuid, auth.uid())
  );

CREATE POLICY "Reviewers write to reviews subfolder"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'complee-docs'
    AND public.is_workspace_reviewer(((storage.foldername(name))[1])::uuid, auth.uid())
    AND (storage.foldername(name))[2] = 'reviews'
  );
