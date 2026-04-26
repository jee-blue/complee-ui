// Document signing helpers — signature metadata only (no PDF storage).
import { supabase } from "@/integrations/supabase/client";

export type DocumentReviewStatus =
  | "draft"
  | "awaiting_review"
  | "changes_requested"
  | "approved";

export interface SignedDocument {
  id: string;
  assessment_id: string;
  owner_user_id: string;
  requirement_id: string;
  document_title: string;
  signer_name: string;
  signature_hash: string;
  signed_ip: string | null;
  signed_user_agent: string | null;
  signed_at: string;
  review_status: DocumentReviewStatus;
  reviewer_user_id: string | null;
  reviewer_name: string | null;
  reviewer_signature_hash: string | null;
  reviewer_signed_at: string | null;
  created_at: string;
  updated_at: string;
}

async function sha256Hex(input: string) {
  const bytes = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function signDocument(opts: {
  assessmentId: string;
  ownerUserId: string;
  requirementId: string;
  documentTitle: string;
  signerName: string;
}): Promise<{ data?: SignedDocument; error?: string }> {
  const ts = new Date().toISOString();
  const ua = typeof navigator !== "undefined" ? navigator.userAgent : null;
  const signature_hash = await sha256Hex(
    [opts.ownerUserId, opts.requirementId, opts.signerName, ts, ua ?? ""].join("|"),
  );

  const { data, error } = await supabase
    .from("signed_documents")
    .upsert(
      {
        assessment_id: opts.assessmentId,
        owner_user_id: opts.ownerUserId,
        requirement_id: opts.requirementId,
        document_title: opts.documentTitle,
        signer_name: opts.signerName,
        signature_hash,
        signed_user_agent: ua,
        signed_at: ts,
        review_status: "awaiting_review" as DocumentReviewStatus,
      },
      { onConflict: "assessment_id,requirement_id" },
    )
    .select()
    .single();

  if (error) return { error: error.message };
  return { data: data as SignedDocument };
}

export async function listSignedDocuments(assessmentId: string) {
  const { data, error } = await supabase
    .from("signed_documents")
    .select("*")
    .eq("assessment_id", assessmentId)
    .order("signed_at", { ascending: false });
  if (error) return { error: error.message, data: [] as SignedDocument[] };
  return { data: (data ?? []) as SignedDocument[] };
}

export async function reviewerApprove(opts: {
  signedDocumentId: string;
  reviewerUserId: string;
  reviewerName: string;
}): Promise<{ data?: SignedDocument; error?: string }> {
  const ts = new Date().toISOString();
  const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
  const reviewer_signature_hash = await sha256Hex(
    [opts.reviewerUserId, opts.signedDocumentId, opts.reviewerName, ts, ua].join("|"),
  );

  const { data, error } = await supabase
    .from("signed_documents")
    .update({
      reviewer_user_id: opts.reviewerUserId,
      reviewer_name: opts.reviewerName,
      reviewer_signature_hash,
      reviewer_signed_at: ts,
      review_status: "approved" as DocumentReviewStatus,
    })
    .eq("id", opts.signedDocumentId)
    .select()
    .single();

  if (error) return { error: error.message };
  return { data: data as SignedDocument };
}

export async function reviewerRequestChanges(opts: {
  signedDocumentId: string;
}): Promise<{ error?: string }> {
  const { error } = await supabase
    .from("signed_documents")
    .update({ review_status: "changes_requested" as DocumentReviewStatus })
    .eq("id", opts.signedDocumentId);
  if (error) return { error: error.message };
  return {};
}
