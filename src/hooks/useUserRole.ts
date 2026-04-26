import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export type AppRole = "fintech_owner" | "reviewer" | "admin";

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
