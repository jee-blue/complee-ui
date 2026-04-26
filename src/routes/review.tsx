import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  ChevronRight,
  Clock,
  FileSignature,
  Loader2,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { Chrome } from "@/components/complee/Chrome";
import { useAuth } from "@/hooks/useAuth";
import {
  listSignedDocuments,
  reviewerApprove,
  reviewerRequestChanges,
  type SignedDocument,
} from "@/lib/documentSigning";
import { listReviewerWorkspaces } from "@/lib/reviewers";
import { toast } from "sonner";

export const Route = createFileRoute("/review")({
  head: () => ({ meta: [{ title: "Reviewer Portal — Complee" }] }),
  component: Review,
});

interface WorkspaceRow {
  invite_id: string;
  assessment_id: string;
  company_name: string;
  home_country: string;
  target_country: string;
  institution_type: string;
}

function Review() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [workspaces, setWorkspaces] = useState<WorkspaceRow[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [docs, setDocs] = useState<SignedDocument[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    void (async () => {
      const r = await listReviewerWorkspaces(user.id);
      type Raw = {
        id: string;
        assessment_id: string;
        assessments: {
          id: string;
          company_name: string;
          home_country: string;
          target_country: string;
          institution_type: string;
        } | null;
      };
      const raw = (r.data ?? []) as unknown as Raw[];
      const rows: WorkspaceRow[] = raw.flatMap((row) => {
        const a = row.assessments;
        if (!a) return [];
        return [{
          invite_id: row.id,
          assessment_id: row.assessment_id,
          company_name: a.company_name,
          home_country: a.home_country,
          target_country: a.target_country,
          institution_type: a.institution_type,
        }];
      });
      setWorkspaces(rows);
      setActiveId((cur) => cur ?? rows[0]?.assessment_id ?? null);
      setHydrated(true);
    })();
  }, [user]);

  useEffect(() => {
    if (!activeId) {
      setDocs([]);
      return;
    }
    void (async () => {
      const r = await listSignedDocuments(activeId);
      setDocs(r.data);
    })();
  }, [activeId]);

  const activeWorkspace = useMemo(
    () => workspaces.find((w) => w.assessment_id === activeId) ?? null,
    [workspaces, activeId],
  );

  const reviewerName =
    (user?.user_metadata?.display_name as string | undefined) ??
    user?.email?.split("@")[0] ??
    "Reviewer";

  const refresh = async () => {
    if (!activeId) return;
    const r = await listSignedDocuments(activeId);
    setDocs(r.data);
  };

  const handleApprove = async (doc: SignedDocument) => {
    if (!user) return;
    setBusyId(doc.id);
    const r = await reviewerApprove({
      signedDocumentId: doc.id,
      reviewerUserId: user.id,
      reviewerName,
    });
    setBusyId(null);
    if (r.error) {
      toast.error("Approval failed", { description: r.error });
      return;
    }
    toast.success("Document approved");
    void refresh();
  };

  const handleRequestChanges = async (doc: SignedDocument) => {
    setBusyId(doc.id);
    const r = await reviewerRequestChanges({ signedDocumentId: doc.id });
    setBusyId(null);
    if (r.error) {
      toast.error("Request failed", { description: r.error });
      return;
    }
    toast("Changes requested");
    void refresh();
  };

  if (loading || !user) {
    return (
      <Chrome>
        <div className="max-w-[1100px] mx-auto px-5 py-16 text-center text-muted-foreground text-[13px]">
          Loading…
        </div>
      </Chrome>
    );
  }

  return (
    <Chrome>
      <div className="max-w-[1100px] mx-auto px-5 sm:px-6 py-8 sm:py-10">
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-soft text-brand px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.1em]">
            <ShieldCheck className="h-3 w-3" />
            Reviewer Portal
          </span>
        </div>
        <h1 className="text-[26px] sm:text-[30px] font-semibold tracking-tight text-navy">
          Workspaces awaiting your review
        </h1>
        <p className="mt-1.5 text-[13px] text-muted-foreground">
          Approve signed documents on behalf of the FinTech owner. Your second signature
          is recorded with timestamp and audit hash.
        </p>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Workspaces */}
          <div className="lg:col-span-4">
            <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-border">
                <h2 className="text-[13px] font-semibold text-navy">Workspaces</h2>
              </div>
              {!hydrated ? (
                <div className="p-6 text-[12.5px] text-muted-foreground inline-flex items-center gap-2">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Loading…
                </div>
              ) : workspaces.length === 0 ? (
                <div className="p-6 text-[12.5px] text-muted-foreground">
                  No workspaces yet. Ask the FinTech owner to send you an invitation
                  link.
                </div>
              ) : (
                <ul className="divide-y divide-border">
                  {workspaces.map((w) => (
                    <li key={w.invite_id}>
                      <button
                        onClick={() => setActiveId(w.assessment_id)}
                        className={`w-full text-left px-4 py-3 flex items-center justify-between gap-3 transition-colors ${
                          activeId === w.assessment_id
                            ? "bg-brand-soft/40"
                            : "hover:bg-surface-muted"
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="text-[13px] font-medium text-navy truncate">
                            {w.company_name}
                          </div>
                          <div className="text-[11px] text-muted-foreground truncate">
                            {w.institution_type} · {w.home_country} → {w.target_country}
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Documents */}
          <div className="lg:col-span-8">
            <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                <h2 className="text-[13px] font-semibold text-navy">
                  {activeWorkspace ? activeWorkspace.company_name : "Documents"}
                </h2>
                <span className="text-[11px] text-muted-foreground">
                  {docs.length} document{docs.length === 1 ? "" : "s"}
                </span>
              </div>
              {!activeWorkspace ? (
                <div className="p-6 text-[12.5px] text-muted-foreground">
                  Select a workspace to see signed documents.
                </div>
              ) : docs.length === 0 ? (
                <div className="p-6 text-[12.5px] text-muted-foreground">
                  No signed documents yet for this workspace.
                </div>
              ) : (
                <ul className="divide-y divide-border">
                  {docs.map((d) => (
                    <li key={d.id} className="px-4 py-4">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div className="min-w-0">
                          <div className="text-[13.5px] font-medium text-navy">
                            {d.document_title}
                          </div>
                          <div className="mt-1 text-[11.5px] text-muted-foreground">
                            Signed by {d.signer_name} · {new Date(d.signed_at).toLocaleString()}
                          </div>
                          <div className="mt-1 text-[11px] text-muted-foreground/80 font-mono break-all">
                            sig: {d.signature_hash.slice(0, 16)}…
                          </div>
                        </div>
                        <ReviewStatusPill status={d.review_status} />
                      </div>

                      {d.review_status === "approved" ? (
                        <div className="mt-3 text-[12px] text-success-foreground inline-flex items-center gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                          Approved by {d.reviewer_name} ·{" "}
                          {d.reviewer_signed_at
                            ? new Date(d.reviewer_signed_at).toLocaleString()
                            : ""}
                        </div>
                      ) : (
                        <div className="mt-3 flex flex-wrap gap-2">
                          <button
                            onClick={() => handleApprove(d)}
                            disabled={busyId === d.id}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-brand text-brand-foreground px-3 py-2 text-[12.5px] font-medium hover:bg-brand/90 shadow-sm disabled:opacity-50"
                          >
                            {busyId === d.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <FileSignature className="h-3.5 w-3.5" />
                            )}
                            Approve as {reviewerName}
                          </button>
                          <button
                            onClick={() => handleRequestChanges(d)}
                            disabled={busyId === d.id}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-[12.5px] font-medium text-navy hover:bg-surface-muted disabled:opacity-50"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            Request changes
                          </button>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="mt-4">
              <Link
                to="/account"
                className="text-[12px] text-muted-foreground hover:text-foreground"
              >
                ← Back to your account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Chrome>
  );
}

function ReviewStatusPill({ status }: { status: SignedDocument["review_status"] }) {
  const map: Record<SignedDocument["review_status"], { label: string; cls: string; icon: React.ReactNode }> = {
    draft: {
      label: "Draft",
      cls: "bg-muted text-muted-foreground border-border",
      icon: <Clock className="h-3 w-3" />,
    },
    awaiting_review: {
      label: "Awaiting review",
      cls: "bg-warn-soft text-warn-foreground border-warn/30",
      icon: <Clock className="h-3 w-3" />,
    },
    changes_requested: {
      label: "Changes requested",
      cls: "bg-danger-soft text-danger border-danger/30",
      icon: <XCircle className="h-3 w-3" />,
    },
    approved: {
      label: "Approved",
      cls: "bg-success-soft text-success-foreground border-success/30",
      icon: <CheckCircle2 className="h-3 w-3" />,
    },
  };
  const v = map[status];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${v.cls}`}>
      {v.icon}
      {v.label}
    </span>
  );
}
