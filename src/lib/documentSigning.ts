// Document signing helpers — signature metadata + PDF storage.
import { supabase } from "@/integrations/supabase/client";
import { buildSignedPdf } from "@/lib/pdfGenerator";

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
  pdf_path: string | null;
  signature_image_path: string | null;
  reviewer_signature_image_path: string | null;
  created_at: string;
  updated_at: string;
}

const BUCKET = "complee-docs";

async function uploadDataUrl(path: string, dataUrl: string, contentType: string) {
  const b64 = dataUrl.split(",")[1] ?? "";
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, bytes, { contentType, upsert: true });
  return error?.message;
}

async function uploadBytes(path: string, bytes: Uint8Array, contentType: string) {
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, bytes, { contentType, upsert: true });
  return error?.message;
}

export async function getSignedUrl(path: string, expiresIn = 60 * 30) {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, expiresIn);
  if (error) return { error: error.message };
  return { url: data.signedUrl };
}

export async function downloadFile(path: string): Promise<{ bytes?: Uint8Array; error?: string }> {
  const { data, error } = await supabase.storage.from(BUCKET).download(path);
  if (error || !data) return { error: error?.message ?? "download failed" };
  const buf = await data.arrayBuffer();
  return { bytes: new Uint8Array(buf) };
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
  signaturePngDataUrl?: string | null;
  companyName?: string;
  regulator?: string;
  description?: string;
  body?: string;
}): Promise<{ data?: SignedDocument; error?: string }> {
  const ts = new Date().toISOString();
  const ua = typeof navigator !== "undefined" ? navigator.userAgent : null;
  const signature_hash = await sha256Hex(
    [opts.ownerUserId, opts.requirementId, opts.signerName, ts, ua ?? ""].join("|"),
  );

  // Upload signature image (if drawn)
  let signature_image_path: string | null = null;
  if (opts.signaturePngDataUrl) {
    const path = `${opts.assessmentId}/signatures/${opts.requirementId}-owner.png`;
    const err = await uploadDataUrl(path, opts.signaturePngDataUrl, "image/png");
    if (!err) signature_image_path = path;
  }

  // Build PDF
  const pdfBytes = await buildSignedPdf({
    title: opts.documentTitle,
    companyName: opts.companyName ?? "",
    requirementId: opts.requirementId,
    regulator: opts.regulator ?? "",
    description: opts.description ?? "",
    body: opts.body ?? "",
    signerName: opts.signerName,
    signedAt: ts,
    signatureHash: signature_hash,
    signaturePngDataUrl: opts.signaturePngDataUrl ?? null,
  });
  const pdf_path = `${opts.assessmentId}/pdfs/${opts.requirementId}.pdf`;
  await uploadBytes(pdf_path, pdfBytes, "application/pdf");

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
        pdf_path,
        signature_image_path,
        // reset reviewer fields on re-sign
        reviewer_user_id: null,
        reviewer_name: null,
        reviewer_signature_hash: null,
        reviewer_signed_at: null,
        reviewer_signature_image_path: null,
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
  reviewerSignaturePngDataUrl?: string | null;
  assessmentId?: string;
  requirementId?: string;
}): Promise<{ data?: SignedDocument; error?: string }> {
  const ts = new Date().toISOString();
  const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
  const reviewer_signature_hash = await sha256Hex(
    [opts.reviewerUserId, opts.signedDocumentId, opts.reviewerName, ts, ua].join("|"),
  );

  let reviewer_signature_image_path: string | null = null;
  if (opts.reviewerSignaturePngDataUrl && opts.assessmentId && opts.requirementId) {
    const path = `${opts.assessmentId}/reviews/${opts.requirementId}-reviewer.png`;
    const err = await uploadDataUrl(
      path,
      opts.reviewerSignaturePngDataUrl,
      "image/png",
    );
    if (!err) reviewer_signature_image_path = path;
  }

  const { data, error } = await supabase
    .from("signed_documents")
    .update({
      reviewer_user_id: opts.reviewerUserId,
      reviewer_name: opts.reviewerName,
      reviewer_signature_hash,
      reviewer_signed_at: ts,
      review_status: "approved" as DocumentReviewStatus,
      reviewer_signature_image_path,
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
