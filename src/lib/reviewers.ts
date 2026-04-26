// Reviewer invitation helpers (owner + reviewer side).
import { supabase } from "@/integrations/supabase/client";

function randomToken() {
  // 24-byte URL-safe token
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export interface WorkspaceReviewer {
  id: string;
  assessment_id: string;
  invited_email: string;
  invite_token: string;
  status: "pending" | "active" | "revoked";
  reviewer_user_id: string | null;
  created_at: string;
  accepted_at: string | null;
}

export async function inviteReviewer(opts: {
  assessmentId: string;
  ownerUserId: string;
  email: string;
}): Promise<{ data?: WorkspaceReviewer; error?: string }> {
  const email = opts.email.trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Enter a valid email address" };
  }
  const token = randomToken();
  const { data, error } = await supabase
    .from("workspace_reviewers")
    .insert({
      assessment_id: opts.assessmentId,
      owner_user_id: opts.ownerUserId,
      invited_email: email,
      invite_token: token,
    })
    .select()
    .single();
  if (error) return { error: error.message };
  return { data: data as WorkspaceReviewer };
}

export async function listOwnerInvites(ownerUserId: string) {
  const { data, error } = await supabase
    .from("workspace_reviewers")
    .select("*")
    .eq("owner_user_id", ownerUserId)
    .order("created_at", { ascending: false });
  if (error) return { error: error.message, data: [] as WorkspaceReviewer[] };
  return { data: (data ?? []) as WorkspaceReviewer[] };
}

export async function revokeInvite(id: string) {
  const { error } = await supabase
    .from("workspace_reviewers")
    .update({ status: "revoked" })
    .eq("id", id);
  return { error: error?.message };
}

export function buildInviteLink(token: string) {
  const origin =
    typeof window !== "undefined" ? window.location.origin : "";
  return `${origin}/accept-invite?token=${encodeURIComponent(token)}`;
}

/**
 * Called after sign-in: claim any pending invitations matching the user's email.
 * Marks workspace_reviewers row(s) as active and assigns reviewer_user_id.
 */
export async function acceptPendingInvitationsForCurrentUser(): Promise<{
  acceptedCount: number;
}> {
  const { data: userResp } = await supabase.auth.getUser();
  const user = userResp?.user;
  if (!user?.email) return { acceptedCount: 0 };

  // RLS allows the user to update pending rows whose invited_email matches their JWT email.
  const { data, error } = await supabase
    .from("workspace_reviewers")
    .update({
      reviewer_user_id: user.id,
      status: "active",
      accepted_at: new Date().toISOString(),
    })
    .eq("status", "pending")
    .ilike("invited_email", user.email)
    .select("id");

  if (error) {
    console.warn("acceptPendingInvitations failed:", error.message);
    return { acceptedCount: 0 };
  }

  // Best-effort: ensure user has reviewer role (RLS blocks direct insert; skip silently).
  return { acceptedCount: data?.length ?? 0 };
}

/** Accept a single invitation by token (used on /accept-invite). */
export async function acceptInviteByToken(
  token: string,
): Promise<{ ok: boolean; error?: string; assessmentId?: string }> {
  const { data: userResp } = await supabase.auth.getUser();
  const user = userResp?.user;
  if (!user?.email) return { ok: false, error: "Not signed in" };

  const { data, error } = await supabase
    .from("workspace_reviewers")
    .update({
      reviewer_user_id: user.id,
      status: "active",
      accepted_at: new Date().toISOString(),
    })
    .eq("invite_token", token)
    .eq("status", "pending")
    .ilike("invited_email", user.email)
    .select("assessment_id")
    .maybeSingle();

  if (error) return { ok: false, error: error.message };
  if (!data) return { ok: false, error: "Invitation not found, already used, or addressed to a different email" };
  return { ok: true, assessmentId: data.assessment_id };
}

export async function listReviewerWorkspaces(reviewerUserId: string) {
  const { data, error } = await supabase
    .from("workspace_reviewers")
    .select("id, assessment_id, status, accepted_at, assessments(id, company_name, home_country, target_country, institution_type)")
    .eq("reviewer_user_id", reviewerUserId)
    .eq("status", "active")
    .order("accepted_at", { ascending: false });
  if (error) return { error: error.message, data: [] as Array<{ id: string; assessment_id: string; assessments: { id: string; company_name: string; home_country: string; target_country: string; institution_type: string } | null }> };
  return { data: (data ?? []) as never };
}
