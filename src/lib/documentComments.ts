// Comments and change requests on signed documents.
import { supabase } from "@/integrations/supabase/client";

export interface DocumentComment {
  id: string;
  signed_document_id: string;
  assessment_id: string;
  author_user_id: string;
  author_name: string;
  author_role: "owner" | "reviewer";
  body: string;
  resolved: boolean;
  created_at: string;
  updated_at: string;
}

export async function listComments(signedDocumentId: string) {
  const { data, error } = await supabase
    .from("document_comments")
    .select("*")
    .eq("signed_document_id", signedDocumentId)
    .order("created_at", { ascending: true });
  if (error) return { data: [] as DocumentComment[], error: error.message };
  return { data: (data ?? []) as DocumentComment[] };
}

export async function addComment(opts: {
  signedDocumentId: string;
  assessmentId: string;
  authorUserId: string;
  authorName: string;
  authorRole: "owner" | "reviewer";
  body: string;
}) {
  const body = opts.body.trim();
  if (!body) return { error: "Comment cannot be empty" };
  const { data, error } = await supabase
    .from("document_comments")
    .insert({
      signed_document_id: opts.signedDocumentId,
      assessment_id: opts.assessmentId,
      author_user_id: opts.authorUserId,
      author_name: opts.authorName,
      author_role: opts.authorRole,
      body,
    })
    .select()
    .single();
  if (error) return { error: error.message };
  return { data: data as DocumentComment };
}

export async function setResolved(id: string, resolved: boolean) {
  const { error } = await supabase
    .from("document_comments")
    .update({ resolved })
    .eq("id", id);
  return { error: error?.message };
}
