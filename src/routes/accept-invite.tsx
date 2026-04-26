import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, ShieldCheck, XCircle } from "lucide-react";
import { Chrome } from "@/components/complee/Chrome";
import { useAuth } from "@/hooks/useAuth";
import { acceptInviteByToken } from "@/lib/reviewers";

export const Route = createFileRoute("/accept-invite")({
  head: () => ({ meta: [{ title: "Accept reviewer invitation — Complee" }] }),
  validateSearch: (search: Record<string, unknown>) => ({
    token: typeof search.token === "string" ? search.token : "",
  }),
  component: AcceptInvite,
});

function AcceptInvite() {
  const { token } = Route.useSearch();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [state, setState] = useState<"working" | "ok" | "err">("working");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    if (loading) return;
    if (!token) {
      setState("err");
      setMessage("Missing invitation token.");
      return;
    }
    if (!user) {
      // Send to auth with a returnTo back here.
      const ret = `/accept-invite?token=${encodeURIComponent(token)}`;
      navigate({
        to: "/auth",
        search: { returnTo: ret } as never,
      });
      return;
    }
    void (async () => {
      const r = await acceptInviteByToken(token);
      if (r.ok) {
        setState("ok");
        setMessage("Invitation accepted. Redirecting to the reviewer portal…");
        setTimeout(() => navigate({ to: "/review" }), 1200);
      } else {
        setState("err");
        setMessage(r.error ?? "Failed to accept invitation.");
      }
    })();
  }, [token, user, loading, navigate]);

  return (
    <Chrome>
      <div className="max-w-[440px] mx-auto px-5 sm:px-6 py-12 sm:py-16">
        <div className="rounded-2xl border border-border bg-card shadow-sm p-6 sm:p-8 text-center">
          <div className="h-10 w-10 rounded-lg bg-brand-soft text-brand flex items-center justify-center mx-auto mb-3">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h1 className="text-[20px] font-semibold tracking-tight text-navy">
            Reviewer invitation
          </h1>

          <div className="mt-6 flex items-center justify-center gap-2 text-[13px]">
            {state === "working" && (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-brand" />
                <span className="text-muted-foreground">Verifying invitation…</span>
              </>
            )}
            {state === "ok" && (
              <>
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span className="text-navy">{message}</span>
              </>
            )}
            {state === "err" && (
              <>
                <XCircle className="h-4 w-4 text-danger" />
                <span className="text-danger">{message}</span>
              </>
            )}
          </div>

          {state === "err" && (
            <div className="mt-6">
              <Link
                to="/"
                className="inline-flex items-center justify-center rounded-lg bg-brand text-brand-foreground px-4 py-2.5 text-[13px] font-medium hover:bg-brand/90 shadow-sm"
              >
                Go home
              </Link>
            </div>
          )}
        </div>
      </div>
    </Chrome>
  );
}
