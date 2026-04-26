import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  CircleDashed,
  FileText,
  Scale,
  Sparkles,
  Trash2,
  UploadCloud,
  X,
  AlertCircle,
} from "lucide-react";
import { Chrome } from "@/components/complee/Chrome";
import { useAssessment, type UploadedDocument } from "@/store/assessment";

export const Route = createFileRoute("/documents")({
  head: () => ({ meta: [{ title: "Evidence — Complee" }] }),
  component: Documents,
});

const SAMPLE_DOCS: UploadedDocument[] = [
  { id: "fp-1", name: "FlowPay EMI Authorisation Dossier.pdf", pages: 84, sample: true },
  { id: "fp-2", name: "FlowPay AML Risk Assessment France.pdf", pages: 32, sample: true },
  { id: "fp-3", name: "FlowPay Safeguarding Policy.pdf", pages: 18, sample: true },
  { id: "fp-4", name: "FlowPay ICT Risk Register.pdf", pages: 24, sample: true },
  { id: "fp-5", name: "FlowPay Complaints Handling Procedure.pdf", pages: 12, sample: true },
];

// PSD3/PSR evidence packs grouped by theme
type EvidenceGroup = "Authorization" | "Operational controls" | "Customer protection" | "Governance";

interface EvidencePack {
  id: string;
  name: string;
  summary: string;
  reqIds: string[];
  group: EvidenceGroup;
  matchKeywords: string[];
}

const EVIDENCE_PACKS: EvidencePack[] = [
  {
    id: "ep-auth-1",
    name: "Authorisation dossier",
    summary: "Programme of operations, business plan and licence application materials.",
    reqIds: ["PSR-3", "PSR-5"],
    group: "Authorization",
    matchKeywords: ["authorisation", "authorization", "licence", "license", "dossier"],
  },
  {
    id: "ep-auth-2",
    name: "Initial capital evidence",
    summary: "Proof of own funds and capital adequacy at authorisation.",
    reqIds: ["PSR-7"],
    group: "Authorization",
    matchKeywords: ["capital", "own funds", "adequacy"],
  },
  {
    id: "ep-auth-3",
    name: "Safeguarding methodology",
    summary: "How customer funds are segregated, reconciled and protected daily.",
    reqIds: ["PSR-23", "PSR-24"],
    group: "Authorization",
    matchKeywords: ["safeguard", "segregat", "reconcil"],
  },
  {
    id: "ep-ops-1",
    name: "ICT risk register",
    summary: "Inventory of systems, third-party providers and operational risks.",
    reqIds: ["PSR-OP-1"],
    group: "Operational controls",
    matchKeywords: ["ict", "risk register", "operational risk"],
  },
  {
    id: "ep-ops-2",
    name: "Incident response plan",
    summary: "Major incident classification, escalation and regulator notification.",
    reqIds: ["PSR-OP-2"],
    group: "Operational controls",
    matchKeywords: ["incident", "response", "escalation"],
  },
  {
    id: "ep-ops-3",
    name: "Fraud monitoring framework",
    summary: "Fraud detection rules, KPIs and SCA exemption logic.",
    reqIds: ["PSR-15", "PSR-16"],
    group: "Operational controls",
    matchKeywords: ["fraud", "sca", "authentication"],
  },
  {
    id: "ep-cust-1",
    name: "Complaints handling procedure",
    summary: "End-to-end complaints workflow and FOS escalation paths.",
    reqIds: ["PSR-101"],
    group: "Customer protection",
    matchKeywords: ["complaint", "fos", "handling"],
  },
  {
    id: "ep-cust-2",
    name: "Pre-contractual disclosures",
    summary: "Customer-facing terms, fees and liability disclosures.",
    reqIds: ["PSR-43", "PSR-44"],
    group: "Customer protection",
    matchKeywords: ["disclosure", "terms", "pre-contract", "fees"],
  },
  {
    id: "ep-gov-1",
    name: "Governance & board pack",
    summary: "Board composition, committees, ToR and decision-making evidence.",
    reqIds: ["PSR-G-1"],
    group: "Governance",
    matchKeywords: ["governance", "board", "committee", "tor"],
  },
  {
    id: "ep-gov-2",
    name: "Fit & proper assessments",
    summary: "Senior manager screening, integrity checks and conflicts policy.",
    reqIds: ["PSR-G-2"],
    group: "Governance",
    matchKeywords: ["fit and proper", "fit & proper", "integrity", "screening"],
  },
  {
    id: "ep-gov-3",
    name: "AML / financial crime policy",
    summary: "MLRO appointment, customer due diligence and ongoing monitoring.",
    reqIds: ["PSR-G-3"],
    group: "Governance",
    matchKeywords: ["aml", "mlro", "money laundering", "due diligence", "kyc"],
  },
];

const GROUPS: EvidenceGroup[] = [
  "Authorization",
  "Operational controls",
  "Customer protection",
  "Governance",
];

type PackStatus = "missing" | "uploaded" | "matched" | "review";

function matchPack(pack: EvidencePack, docs: UploadedDocument[]): PackStatus {
  const lowered = docs.map((d) => d.name.toLowerCase());
  const hits = lowered.filter((name) =>
    pack.matchKeywords.some((kw) => name.includes(kw)),
  );
  if (hits.length === 0) return "missing";
  if (hits.length === 1) return "uploaded";
  return "matched";
}

const STATUS_META: Record<
  PackStatus,
  { label: string; cls: string; icon: typeof CheckCircle2 }
> = {
  missing: {
    label: "Missing",
    cls: "bg-muted text-muted-foreground border-border",
    icon: CircleDashed,
  },
  uploaded: {
    label: "Uploaded",
    cls: "bg-brand-soft text-brand border-brand/30",
    icon: FileText,
  },
  matched: {
    label: "Matched",
    cls: "bg-success-soft text-success border-success/30",
    icon: CheckCircle2,
  },
  review: {
    label: "Needs review",
    cls: "bg-warning-soft text-warning border-warning/30",
    icon: AlertCircle,
  },
};

function Documents() {
  const navigate = useNavigate();
  const {
    uploadedDocuments,
    samplePackSelected,
    setSamplePackSelected,
    setUploadedDocuments,
    addUploadedDocument,
    removeUploadedDocument,
  } = useAssessment();
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const packStatuses = useMemo(
    () =>
      EVIDENCE_PACKS.map((pack) => ({
        pack,
        status: matchPack(pack, uploadedDocuments),
      })),
    [uploadedDocuments],
  );

  const total = EVIDENCE_PACKS.length;
  const uploadedCount = packStatuses.filter((p) => p.status !== "missing").length;
  const remaining = total - uploadedCount;
  const pct = Math.round((uploadedCount / total) * 100);

  // Threshold: at least 60% of packs covered to enable analysis
  const threshold = Math.ceil(total * 0.6);
  const canContinue =
    samplePackSelected || uploadedCount >= threshold || uploadedDocuments.length >= threshold;

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files)
      .filter((f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf"))
      .forEach((f) => {
        addUploadedDocument({
          id: `u-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          name: f.name,
          pages: Math.max(2, Math.round(f.size / 30000)),
        });
      });
  };

  const loadSamplePack = () => {
    setSamplePackSelected(true);
    setUploadedDocuments(SAMPLE_DOCS);
  };

  const clearSamplePack = () => {
    setSamplePackSelected(false);
    setUploadedDocuments(uploadedDocuments.filter((d) => !d.sample));
  };

  return (
    <Chrome>
      <div className="max-w-[1180px] 2xl:max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* 1. Context */}
        <div className="mb-8 sm:mb-10">
          <p className="text-[12px] uppercase tracking-[0.14em] text-brand font-medium mb-2">
            Step 2 — Evidence
          </p>
          <div className="flex items-start gap-3 mb-3 flex-wrap">
            <h1 className="text-[24px] sm:text-[32px] font-semibold tracking-tight text-navy">
              Upload evidence required for your PSD3/PSR assessment
            </h1>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-soft border border-brand/20 text-brand px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.08em] mt-2">
              <Scale className="h-3 w-3" />
              PSD3 / PSR
            </span>
          </div>
          <p className="text-[14px] sm:text-[15px] text-muted-foreground max-w-[720px]">
            Based on the services selected in Step 1, Complee generated{" "}
            <span className="font-medium text-navy">{total} evidence packs</span> you need to
            provide.
          </p>
        </div>

        {/* Progress summary */}
        <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-sm mb-6">
          <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
            <div className="flex items-center gap-6 sm:gap-8">
              <Stat value={total} label="Required" tone="muted" />
              <Divider />
              <Stat value={uploadedCount} label="Uploaded" tone="brand" />
              <Divider />
              <Stat value={remaining} label="Remaining" tone={remaining === 0 ? "success" : "muted"} />
            </div>
            <div className="text-right">
              <div className="text-[20px] font-semibold text-navy tabular-nums">{pct}%</div>
              <div className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
                Coverage
              </div>
            </div>
          </div>
          <div className="h-2 rounded-full bg-surface-muted overflow-hidden">
            <div
              className="h-full bg-brand transition-all duration-500"
              style={{ width: `${pct}%` }}
              role="progressbar"
              aria-valuenow={pct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${pct} percent of required evidence uploaded`}
            />
          </div>
        </div>

        {/* 2. Required evidence checklist (HERO) */}
        <section className="mb-8" aria-labelledby="checklist-heading">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div>
              <h2
                id="checklist-heading"
                className="text-[16px] font-semibold text-navy"
              >
                Required evidence
              </h2>
              <p className="text-[12.5px] text-muted-foreground mt-0.5">
                Each pack maps to one or more PSD3/PSR requirements.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {GROUPS.map((group) => {
              const items = packStatuses.filter((p) => p.pack.group === group);
              const groupDone = items.filter((i) => i.status !== "missing").length;
              return (
                <div key={group}>
                  <div className="flex items-center gap-2 mb-2.5">
                    <h3 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-navy/70">
                      {group}
                    </h3>
                    <span className="text-[11px] text-muted-foreground tabular-nums">
                      {groupDone}/{items.length}
                    </span>
                  </div>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {items.map(({ pack, status }) => (
                      <PackCard key={pack.id} pack={pack} status={status} />
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>

        {/* 3. Upload area (secondary) + Sample pack */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6" aria-label="Upload">
          <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-[14px] font-semibold text-navy">Add evidence</h2>
                <p className="text-[12.5px] text-muted-foreground">
                  PDFs only. Drop multiple files at once.
                </p>
              </div>
            </div>
            <div
              role="button"
              tabIndex={0}
              aria-label="Upload PDF files: drop here or press Enter to browse"
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                handleFiles(e.dataTransfer.files);
              }}
              onClick={() => inputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  inputRef.current?.click();
                }
              }}
              className={`min-h-[140px] rounded-xl border-2 border-dashed flex flex-col items-center justify-center text-center px-6 py-6 cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 ${
                dragOver
                  ? "border-brand bg-brand-soft/40"
                  : "border-border bg-surface-muted hover:border-brand/40"
              }`}
            >
              <UploadCloud className="h-6 w-6 text-brand mb-2" aria-hidden="true" />
              <p className="text-[13.5px] font-medium text-navy">Drop PDF files here</p>
              <p className="text-[12px] text-muted-foreground mt-0.5">or click to browse</p>
              <input
                ref={inputRef}
                type="file"
                accept="application/pdf,.pdf"
                multiple
                className="sr-only"
                aria-label="Upload PDF files"
                onChange={(e) => handleFiles(e.target.files)}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-[14px] font-semibold text-navy">FlowPay sample pack</h2>
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-brand bg-brand-soft px-2 py-0.5 rounded-full">
                <Sparkles className="h-3 w-3" />
                Demo
              </span>
            </div>
            <p className="text-[12.5px] text-muted-foreground mb-3">
              Load 5 demo PDFs to skip ahead and explore the assessment.
            </p>
            {samplePackSelected ? (
              <button
                onClick={clearSamplePack}
                className="w-full rounded-lg border border-border bg-card text-navy px-3 py-2 text-[13px] font-medium hover:bg-surface-muted transition-colors inline-flex items-center justify-center gap-2"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Remove sample pack
              </button>
            ) : (
              <button
                onClick={loadSamplePack}
                className="w-full rounded-lg bg-navy text-navy-foreground px-3 py-2 text-[13px] font-medium hover:bg-navy/90 transition-colors"
              >
                Use sample pack
              </button>
            )}
          </div>
        </section>

        {/* 4. Uploaded documents */}
        {uploadedDocuments.length > 0 && (
          <section className="mb-8 rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[14px] font-semibold text-navy">
                Your evidence ({uploadedDocuments.length})
              </h3>
              {samplePackSelected && (
                <span className="text-[11px] text-muted-foreground">Sample pack loaded</span>
              )}
            </div>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {uploadedDocuments.map((d) => (
                <li
                  key={d.id}
                  className="flex items-center gap-3 rounded-lg border border-border bg-surface-muted px-3 py-2.5"
                >
                  <div className="h-8 w-8 rounded-md bg-card border border-border flex items-center justify-center shrink-0">
                    <FileText className="h-4 w-4 text-brand" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-medium text-navy truncate">{d.name}</div>
                    <div className="text-[11px] text-muted-foreground">
                      PDF · {d.pages ?? "—"} pages
                      {d.sample && " · sample"}
                    </div>
                  </div>
                  {!d.sample && (
                    <button
                      onClick={() => removeUploadedDocument(d.id)}
                      className="h-7 w-7 rounded-md hover:bg-card flex items-center justify-center text-muted-foreground"
                      aria-label="Remove"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* CTA */}
        <div className="flex items-center justify-between gap-3 flex-wrap pt-2">
          <Link
            to="/profile"
            className="text-[13px] text-muted-foreground hover:text-foreground transition-colors rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 px-1 py-1"
          >
            ← Back
          </Link>
          <div className="flex items-center gap-3">
            {!canContinue && (
              <span className="text-[12px] text-muted-foreground hidden sm:inline">
                Upload at least {threshold} packs to continue
              </span>
            )}
            <button
              disabled={!canContinue}
              aria-disabled={!canContinue || undefined}
              onClick={() => navigate({ to: "/processing" })}
              className="inline-flex items-center gap-2 rounded-lg bg-navy text-navy-foreground px-5 py-3 min-h-[44px] text-[14px] font-medium hover:bg-navy/90 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            >
              Run readiness assessment
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </Chrome>
  );
}

function PackCard({ pack, status }: { pack: EvidencePack; status: PackStatus }) {
  const meta = STATUS_META[status];
  const Icon = meta.icon;
  const isMissing = status === "missing";
  return (
    <li
      className={`group rounded-xl border bg-card p-4 transition-colors ${
        isMissing ? "border-border" : "border-success/20 bg-success-soft/20"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`h-8 w-8 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 ${meta.cls}`}
        >
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-[13.5px] font-medium text-navy leading-snug">{pack.name}</h4>
            <span
              className={`inline-flex items-center gap-1 text-[10.5px] font-medium px-2 py-0.5 rounded-full border whitespace-nowrap ${meta.cls}`}
            >
              {meta.label}
            </span>
          </div>
          <p className="text-[12.5px] text-muted-foreground mt-1 leading-relaxed">
            {pack.summary}
          </p>
          <div className="flex flex-wrap gap-1 mt-2">
            {pack.reqIds.map((id) => (
              <span
                key={id}
                className="text-[10px] font-mono text-muted-foreground bg-surface-muted border border-border rounded px-1.5 py-0.5"
              >
                {id}
              </span>
            ))}
          </div>
        </div>
      </div>
    </li>
  );
}

function Stat({
  value,
  label,
  tone,
}: {
  value: number;
  label: string;
  tone: "muted" | "brand" | "success";
}) {
  const toneCls =
    tone === "brand" ? "text-brand" : tone === "success" ? "text-success" : "text-navy";
  return (
    <div>
      <div className={`text-[22px] font-semibold tabular-nums ${toneCls}`}>{value}</div>
      <div className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground mt-0.5">
        {label}
      </div>
    </div>
  );
}

function Divider() {
  return <div className="h-8 w-px bg-border" aria-hidden="true" />;
}
