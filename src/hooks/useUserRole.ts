// Complee — Determine the effective role for the current user.
// A user is treated as "reviewer" mode when they have the `reviewer` role
// and own no assessments themselves. Owners always see the full app.
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export type AppRole = "fintech_owner" | "reviewer" | "admin";
export type EffectiveRole = "owner" | "reviewer" | "loading" | "anonymous";

export function useUserRoles() {
  const { user } = useAuth();
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    if (!user) {
      setRoles([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .then(({ data }) => {
        if (cancelled) return;
        setRoles(((data ?? []) as { role: AppRole }[]).map((r) => r.role));
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  return {
    roles,
    loading,
    isOwner: roles.includes("fintech_owner"),
    isReviewer: roles.includes("reviewer"),
    isAdmin: roles.includes("admin"),
  };
}

/**
 * Effective role: a reviewer-only user (no owned assessments) is routed to
 * the reviewer portal; everyone else (including reviewers who also own a
 * workspace) gets the full owner experience.
 */
export function useEffectiveRole(): EffectiveRole {
  const { user, loading } = useAuth();
  const [role, setRole] = useState<EffectiveRole>("loading");

  useEffect(() => {
    let cancelled = false;
    const determine = async () => {
      if (loading) {
        setRole("loading");
        return;
      }
      if (!user) {
        setRole("anonymous");
        return;
      }
      const [{ data: roles }, { data: ownedAssessments }] = await Promise.all([
        supabase.from("user_roles").select("role").eq("user_id", user.id),
        supabase.from("assessments").select("id").eq("user_id", user.id).limit(1),
      ]);
      if (cancelled) return;
      const isReviewer = (roles ?? []).some((r) => r.role === "reviewer");
      const ownsAssessments = (ownedAssessments ?? []).length > 0;
      setRole(isReviewer && !ownsAssessments ? "reviewer" : "owner");
    };
    void determine();
    return () => {
      cancelled = true;
    };
  }, [user, loading]);

  return role;
}
