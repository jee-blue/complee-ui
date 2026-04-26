import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, MessageSquare } from "lucide-react";
import {
  addComment,
  listComments,
  setResolved,
  type DocumentComment,
} from "@/lib/documentComments";

interface Props {
  signedDocumentId: string;
  assessmentId: string;
  authorUserId: string;
  authorName: string;
  authorRole: "owner" | "reviewer";
}

export function CommentThread({
  signedDocumentId,
  assessmentId,
  authorUserId,
  authorName,
  authorRole,
}: Props) {
  const [comments, setComments] = useState<DocumentComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);

  const refresh = async () => {
    const r = await listComments(signedDocumentId);
    setComments(r.data);
  };

  useEffect(() => {
    setLoading(true);
    void refresh().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signedDocumentId]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim() || busy) return;
    setBusy(true);
    const r = await addComment({
      signedDocumentId,
      assessmentId,
      authorUserId,
      authorName,
      authorRole,
      body,
    });
    setBusy(false);
    if (!r.error) {
      setBody("");
      void refresh();
    }
  };

  const toggleResolved = async (c: DocumentComment) => {
    await setResolved(c.id, !c.resolved);
    void refresh();
  };

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="px-3.5 py-2.5 border-b border-border bg-surface-muted inline-flex items-center gap-1.5 w-full">
        <MessageSquare className="h-3.5 w-3.5 text-brand" />
        <span className="text-[12px] font-semibold text-navy">
          Comments & change requests
        </span>
        <span className="ml-auto text-[11px] text-muted-foreground">
          {comments.length}
        </span>
      </div>

      <div className="px-3.5 py-3 space-y-3 max-h-[260px] overflow-y-auto">
        {loading ? (
          <div className="text-[12px] text-muted-foreground inline-flex items-center gap-2">
            <Loader2 className="h-3 w-3 animate-spin" /> Loading…
          </div>
        ) : comments.length === 0 ? (
          <div className="text-[12px] text-muted-foreground">
            No comments yet.
          </div>
        ) : (
          comments.map((c) => (
            <div key={c.id} className="text-[12.5px]">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-navy">{c.author_name}</span>
                <span
                  className={`text-[10px] uppercase tracking-[0.06em] rounded-full px-1.5 py-0.5 font-semibold ${
                    c.author_role === "reviewer"
                      ? "bg-brand-soft text-brand"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {c.author_role}
                </span>
                <span className="text-[10.5px] text-muted-foreground">
                  {new Date(c.created_at).toLocaleString()}
                </span>
                {c.resolved && (
                  <span className="inline-flex items-center gap-1 text-[10.5px] text-success-foreground">
                    <CheckCircle2 className="h-3 w-3 text-success" /> resolved
                  </span>
                )}
              </div>
              <div
                className={`whitespace-pre-wrap rounded-md border border-border px-2.5 py-1.5 ${
                  c.resolved ? "bg-success-soft/30 text-muted-foreground" : "bg-surface-muted"
                }`}
              >
                {c.body}
              </div>
              {c.author_user_id === authorUserId && (
                <button
                  type="button"
                  onClick={() => toggleResolved(c)}
                  className="mt-1 text-[10.5px] text-muted-foreground hover:text-foreground"
                >
                  {c.resolved ? "Reopen" : "Mark resolved"}
                </button>
              )}
            </div>
          ))
        )}
      </div>

      <form
        onSubmit={submit}
        className="border-t border-border p-2.5 flex items-end gap-2"
      >
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={2}
          placeholder={
            authorRole === "reviewer"
              ? "Request a change or leave feedback…"
              : "Reply to reviewer…"
          }
          className="flex-1 resize-none rounded-md border border-border bg-card px-2.5 py-2 text-[12.5px] focus:outline-none focus:ring-2 focus:ring-brand/40"
        />
        <button
          type="submit"
          disabled={!body.trim() || busy}
          className="inline-flex items-center gap-1.5 rounded-md bg-brand text-brand-foreground px-3 py-2 text-[12px] font-medium hover:bg-brand/90 disabled:opacity-40"
        >
          {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : "Post"}
        </button>
      </form>
    </div>
  );
}
