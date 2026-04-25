// Complee — Sync local Zustand state with Supabase when authenticated.
// - On login: hydrate from cloud (if cloud has data) OR push local up.
// - Debounced upserts on profile / progress changes.

import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useAssessment } from "@/store/assessment";
import { useStepProgress } from "@/store/stepProgress";

let currentAssessmentId: string | null = null;

export function getCurrentAssessmentId() {
  return currentAssessmentId;
}

async function ensureAssessment(userId: string) {
  const { profile, selectedServices, assessmentResults } = useAssessment.getState();

  // Try fetch most recent
  const { data: existing } = await supabase
    .from("assessments")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing) {
    currentAssessmentId = existing.id;
    // Pull cloud profile back into local store
    useAssessment.getState().setProfile({
      companyName: existing.company_name,
      homeCountry: existing.home_country as never,
      targetCountry: existing.target_country as never,
      institutionType: existing.institution_type as never,
    });
    if (Array.isArray(existing.selected_services)) {
      useAssessment.getState().setSelectedServices(existing.selected_services as string[]);
    }
    if (existing.results) {
      useAssessment.getState().setAssessmentResults(existing.results as never);
    }
    return existing.id;
  }

  // Create new
  const { data: created, error } = await supabase
    .from("assessments")
    .insert({
      user_id: userId,
      company_name: profile.companyName,
      home_country: profile.homeCountry,
      target_country: profile.targetCountry,
      institution_type: profile.institutionType,
      selected_services: selectedServices,
      results: assessmentResults as never,
    })
    .select()
    .single();

  if (error || !created) return null;
  currentAssessmentId = created.id;
  return created.id;
}

async function hydrateProgress(userId: string, assessmentId: string) {
  const { data } = await supabase
    .from("step_progress")
    .select("requirement_id,status,completed_substeps,form_inputs,notes,updated_at")
    .eq("user_id", userId)
    .eq("assessment_id", assessmentId);
  if (data && data.length > 0) {
    useStepProgress.getState().hydrate(data as never);
  }
}

export function useCloudSync() {
  const { user } = useAuth();
  const lastProfileSync = useRef(0);
  const lastProgressSync = useRef<Record<string, number>>({});

  // Hydrate on login
  useEffect(() => {
    if (!user) {
      currentAssessmentId = null;
      return;
    }
    (async () => {
      const id = await ensureAssessment(user.id);
      if (id) await hydrateProgress(user.id, id);
    })();
  }, [user]);

  // Sync assessment changes (profile, services, results)
  useEffect(() => {
    if (!user) return;
    const unsub = useAssessment.subscribe((state) => {
      const id = currentAssessmentId;
      if (!id) return;
      // simple debounce
      const now = Date.now();
      if (now - lastProfileSync.current < 800) return;
      lastProfileSync.current = now;
      void supabase
        .from("assessments")
        .update({
          company_name: state.profile.companyName,
          home_country: state.profile.homeCountry,
          target_country: state.profile.targetCountry,
          institution_type: state.profile.institutionType,
          selected_services: state.selectedServices,
          results: state.assessmentResults as never,
        })
        .eq("id", id);
    });
    return () => unsub();
  }, [user]);

  // Sync per-step progress
  useEffect(() => {
    if (!user) return;
    const unsub = useStepProgress.subscribe((state, prev) => {
      const id = currentAssessmentId;
      if (!id) return;
      // find changed key
      for (const key of Object.keys(state.byKey)) {
        const cur = state.byKey[key];
        const before = prev.byKey[key];
        if (before && before.updatedAt === cur.updatedAt) continue;
        const last = lastProgressSync.current[key] ?? 0;
        const now = Date.now();
        if (now - last < 600) continue;
        lastProgressSync.current[key] = now;
        void supabase.from("step_progress").upsert(
          {
            user_id: user.id,
            assessment_id: id,
            requirement_id: key,
            status: cur.status,
            completed_substeps: cur.completedSubsteps as never,
            form_inputs: cur.formInputs as never,
            notes: cur.notes ?? null,
            completed_at: cur.status === "done" ? new Date().toISOString() : null,
          },
          { onConflict: "user_id,assessment_id,requirement_id" },
        );
      }
    });
    return () => unsub();
  }, [user]);
}
