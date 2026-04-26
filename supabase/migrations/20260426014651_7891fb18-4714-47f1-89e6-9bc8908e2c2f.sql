-- 1. Roles
CREATE TYPE public.app_role AS ENUM ('fintech_owner', 'reviewer', 'admin');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users view own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- Roles are assigned via trigger / invite flow (server-side); no direct insert by users.

-- 2. Workspace reviewers (invitations)
CREATE TYPE public.reviewer_status AS ENUM ('pending', 'active', 'revoked');

CREATE TABLE public.workspace_reviewers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id uuid NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
  owner_user_id uuid NOT NULL,
  invited_email text NOT NULL,
  invite_token text NOT NULL UNIQUE,
  reviewer_user_id uuid,
  status reviewer_status NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  accepted_at timestamptz
);

CREATE INDEX idx_workspace_reviewers_token ON public.workspace_reviewers(invite_token);
CREATE INDEX idx_workspace_reviewers_assessment ON public.workspace_reviewers(assessment_id);
CREATE INDEX idx_workspace_reviewers_reviewer ON public.workspace_reviewers(reviewer_user_id);

ALTER TABLE public.workspace_reviewers ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_workspace_reviewer(_assessment_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.workspace_reviewers
    WHERE assessment_id = _assessment_id
      AND reviewer_user_id = _user_id
      AND status = 'active'
  )
$$;

-- Owner can manage their invites
CREATE POLICY "Owners view own invites"
  ON public.workspace_reviewers FOR SELECT
  USING (auth.uid() = owner_user_id);

CREATE POLICY "Owners create invites"
  ON public.workspace_reviewers FOR INSERT
  WITH CHECK (auth.uid() = owner_user_id);

CREATE POLICY "Owners update own invites"
  ON public.workspace_reviewers FOR UPDATE
  USING (auth.uid() = owner_user_id);

CREATE POLICY "Owners delete own invites"
  ON public.workspace_reviewers FOR DELETE
  USING (auth.uid() = owner_user_id);

-- Reviewer can see their own accepted invites
CREATE POLICY "Reviewer sees own accepted invites"
  ON public.workspace_reviewers FOR SELECT
  USING (auth.uid() = reviewer_user_id);

-- Reviewer can accept their own pending invite (set reviewer_user_id + status)
CREATE POLICY "Reviewer accepts own invite"
  ON public.workspace_reviewers FOR UPDATE
  USING (
    status = 'pending'
    AND (reviewer_user_id IS NULL OR reviewer_user_id = auth.uid())
    AND lower(invited_email) = lower(coalesce((auth.jwt() ->> 'email')::text, ''))
  );

-- 3. Extend assessments RLS so reviewers can read their workspaces
CREATE POLICY "Reviewers view invited assessments"
  ON public.assessments FOR SELECT
  USING (public.is_workspace_reviewer(id, auth.uid()));

-- 4. Signed documents (signature metadata only)
CREATE TYPE public.document_review_status AS ENUM ('draft', 'awaiting_review', 'changes_requested', 'approved');

CREATE TABLE public.signed_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id uuid NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
  owner_user_id uuid NOT NULL,
  requirement_id text NOT NULL,
  document_title text NOT NULL,
  signer_name text NOT NULL,
  signature_hash text NOT NULL,
  signed_ip text,
  signed_user_agent text,
  signed_at timestamptz NOT NULL DEFAULT now(),
  review_status document_review_status NOT NULL DEFAULT 'awaiting_review',
  reviewer_user_id uuid,
  reviewer_name text,
  reviewer_signature_hash text,
  reviewer_signed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (assessment_id, requirement_id)
);

CREATE INDEX idx_signed_documents_assessment ON public.signed_documents(assessment_id);

ALTER TABLE public.signed_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner manages own signed documents"
  ON public.signed_documents FOR ALL
  USING (auth.uid() = owner_user_id)
  WITH CHECK (auth.uid() = owner_user_id);

CREATE POLICY "Reviewers read invited signed documents"
  ON public.signed_documents FOR SELECT
  USING (public.is_workspace_reviewer(assessment_id, auth.uid()));

-- Reviewer can stamp their approval (set reviewer fields + status), owner_user_id stays unchanged.
CREATE POLICY "Reviewers approve invited signed documents"
  ON public.signed_documents FOR UPDATE
  USING (public.is_workspace_reviewer(assessment_id, auth.uid()));

CREATE TRIGGER trg_signed_documents_updated_at
BEFORE UPDATE ON public.signed_documents
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. Update handle_new_user trigger to also create default fintech_owner role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, company_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data ->> 'company_name'
  )
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'fintech_owner')
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Ensure trigger exists on auth.users (idempotent)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();