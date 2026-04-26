// Bundle approved signed PDFs + manifest + cover letter into a ZIP.
import JSZip from "jszip";
import { listSignedDocuments, downloadFile, type SignedDocument } from "@/lib/documentSigning";

export interface SubmissionPackOpts {
  assessmentId: string;
  companyName: string;
  homeCountry: string;
  targetCountry: string;
  regulator: string;
  institutionType: string;
}

export async function buildSubmissionPack(opts: SubmissionPackOpts): Promise<Blob> {
  const { data: docs } = await listSignedDocuments(opts.assessmentId);
  const approved = docs.filter((d) => d.review_status === "approved" && d.pdf_path);

  const zip = new JSZip();

  // Cover letter
  const cover = `COMPLEE COMPLIANCE SUBMISSION PACK
====================================

Applicant:        ${opts.companyName}
Home country:     ${opts.homeCountry}
Target market:    ${opts.targetCountry}
Institution type: ${opts.institutionType}
Regulator:        ${opts.regulator}
Generated:        ${new Date().toISOString()}

This pack contains ${approved.length} dual-signed compliance document${approved.length === 1 ? "" : "s"},
each approved by an independent reviewer with cryptographic audit trail.

See manifest.json for hashes and metadata.
`;
  zip.file("00_COVER_LETTER.txt", cover);

  // Manifest
  const manifest = {
    company: opts.companyName,
    target_country: opts.targetCountry,
    regulator: opts.regulator,
    generated_at: new Date().toISOString(),
    document_count: approved.length,
    documents: approved.map((d: SignedDocument) => ({
      requirement_id: d.requirement_id,
      title: d.document_title,
      signed_by: d.signer_name,
      signed_at: d.signed_at,
      signature_hash: d.signature_hash,
      reviewer_name: d.reviewer_name,
      reviewer_signed_at: d.reviewer_signed_at,
      reviewer_signature_hash: d.reviewer_signature_hash,
    })),
  };
  zip.file("manifest.json", JSON.stringify(manifest, null, 2));

  // PDFs
  const folder = zip.folder("documents");
  let i = 1;
  for (const doc of approved) {
    if (!doc.pdf_path) continue;
    const r = await downloadFile(doc.pdf_path);
    if (r.bytes) {
      const safe = doc.document_title
        .replace(/[^a-z0-9]+/gi, "_")
        .replace(/^_+|_+$/g, "")
        .slice(0, 60);
      folder!.file(
        `${String(i).padStart(2, "0")}_${safe || doc.requirement_id}.pdf`,
        r.bytes,
      );
    }
    i++;
  }

  return zip.generateAsync({ type: "blob" });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
