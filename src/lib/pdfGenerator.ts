// Per-step PDF generation with embedded drawn signature.
// Uses pdf-lib (pure JS, edge-safe).
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export interface PdfBuildOpts {
  title: string;
  companyName: string;
  requirementId: string;
  regulator: string;
  description: string;
  body: string;
  signerName: string;
  signedAt: string;
  signatureHash: string;
  signaturePngDataUrl?: string | null;
  reviewerName?: string | null;
  reviewerSignedAt?: string | null;
  reviewerSignatureHash?: string | null;
  reviewerSignaturePngDataUrl?: string | null;
}

const MARGIN = 50;
const PAGE_W = 595.28; // A4
const PAGE_H = 841.89;
const LINE = 14;

function wrap(text: string, font: import("pdf-lib").PDFFont, size: number, maxW: number) {
  const lines: string[] = [];
  for (const para of text.split(/\n+/)) {
    const words = para.split(/\s+/);
    let line = "";
    for (const w of words) {
      const test = line ? line + " " + w : w;
      if (font.widthOfTextAtSize(test, size) > maxW) {
        if (line) lines.push(line);
        line = w;
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);
    lines.push(""); // blank line between paras
  }
  return lines;
}

async function dataUrlToBytes(dataUrl: string): Promise<Uint8Array> {
  const b64 = dataUrl.split(",")[1] ?? "";
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export async function buildSignedPdf(opts: PdfBuildOpts): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  let page = pdf.addPage([PAGE_W, PAGE_H]);
  let y = PAGE_H - MARGIN;
  const navy = rgb(0.06, 0.13, 0.27);
  const muted = rgb(0.4, 0.45, 0.55);
  const brand = rgb(0.13, 0.42, 0.86);

  const drawHeading = (text: string, size = 18) => {
    page.drawText(text, { x: MARGIN, y, size, font: bold, color: navy });
    y -= size + 8;
  };
  const drawLabel = (text: string) => {
    page.drawText(text, { x: MARGIN, y, size: 9, font: bold, color: muted });
    y -= 12;
  };
  const drawText = (text: string, size = 11) => {
    const lines = wrap(text, font, size, PAGE_W - MARGIN * 2);
    for (const ln of lines) {
      if (y < MARGIN + 80) {
        page = pdf.addPage([PAGE_W, PAGE_H]);
        y = PAGE_H - MARGIN;
      }
      page.drawText(ln, { x: MARGIN, y, size, font, color: rgb(0.13, 0.16, 0.2) });
      y -= LINE;
    }
  };

  // Header band
  page.drawRectangle({ x: 0, y: PAGE_H - 28, width: PAGE_W, height: 28, color: brand });
  page.drawText("COMPLEE  ·  Compliance Document", {
    x: MARGIN, y: PAGE_H - 18, size: 10, font: bold, color: rgb(1, 1, 1),
  });
  y = PAGE_H - 60;

  drawHeading(opts.title, 18);
  page.drawText(`${opts.companyName}  ·  ${opts.regulator}`, {
    x: MARGIN, y, size: 10, font, color: muted,
  });
  y -= 22;

  drawLabel("REQUIREMENT");
  drawText(opts.description);
  y -= 4;

  drawLabel("POLICY / PROCEDURE");
  drawText(opts.body);
  y -= 8;

  // Signature block
  if (y < MARGIN + 200) {
    page = pdf.addPage([PAGE_W, PAGE_H]);
    y = PAGE_H - MARGIN;
  }
  page.drawLine({
    start: { x: MARGIN, y }, end: { x: PAGE_W - MARGIN, y },
    thickness: 0.5, color: muted,
  });
  y -= 18;
  drawLabel("SIGNED BY (FINTECH OWNER)");
  page.drawText(opts.signerName, { x: MARGIN, y, size: 13, font: bold, color: navy });
  y -= 18;
  page.drawText(`Date: ${new Date(opts.signedAt).toLocaleString()}`, {
    x: MARGIN, y, size: 9, font, color: muted,
  });
  y -= 14;

  if (opts.signaturePngDataUrl) {
    try {
      const bytes = await dataUrlToBytes(opts.signaturePngDataUrl);
      const img = await pdf.embedPng(bytes);
      const w = 180, h = (img.height / img.width) * w;
      page.drawImage(img, { x: MARGIN, y: y - h, width: w, height: h });
      y -= h + 6;
    } catch { /* ignore */ }
  }
  page.drawText(`Audit hash: ${opts.signatureHash}`, {
    x: MARGIN, y, size: 7, font, color: muted,
  });
  y -= 18;

  if (opts.reviewerName) {
    drawLabel("COUNTER-SIGNED BY (REVIEWER)");
    page.drawText(opts.reviewerName, { x: MARGIN, y, size: 13, font: bold, color: navy });
    y -= 18;
    if (opts.reviewerSignedAt) {
      page.drawText(`Date: ${new Date(opts.reviewerSignedAt).toLocaleString()}`, {
        x: MARGIN, y, size: 9, font, color: muted,
      });
      y -= 14;
    }
    if (opts.reviewerSignaturePngDataUrl) {
      try {
        const bytes = await dataUrlToBytes(opts.reviewerSignaturePngDataUrl);
        const img = await pdf.embedPng(bytes);
        const w = 180, h = (img.height / img.width) * w;
        page.drawImage(img, { x: MARGIN, y: y - h, width: w, height: h });
        y -= h + 6;
      } catch { /* ignore */ }
    }
    if (opts.reviewerSignatureHash) {
      page.drawText(`Reviewer audit hash: ${opts.reviewerSignatureHash}`, {
        x: MARGIN, y, size: 7, font, color: muted,
      });
    }
  }

  return pdf.save();
}
