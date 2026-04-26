// AI assistant edge function for Complee.
// Uses Lovable AI Gateway with streaming. Tool calls let it draft policy text.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ChatBody {
  messages: { role: "user" | "assistant" | "system"; content: string }[];
  context?: {
    requirement_title?: string;
    regulator?: string;
    description?: string;
    company_name?: string;
    home_country?: string;
    target_country?: string;
    institution_type?: string;
  };
  mode?: "chat" | "draft_policy";
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, context, mode }: ChatBody = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const ctxBlock = context
      ? `\n\nCURRENT REQUIREMENT CONTEXT:
- Company: ${context.company_name ?? "(unknown)"} (${context.institution_type ?? ""})
- Expanding from ${context.home_country ?? "?"} to ${context.target_country ?? "?"}
- Regulator: ${context.regulator ?? "?"}
- Requirement: ${context.requirement_title ?? "?"}
- Description: ${context.description ?? "?"}\n`
      : "";

    const systemPrompt =
      mode === "draft_policy"
        ? `You are a senior FinTech compliance officer drafting a formal policy/procedure document for the requirement below. Write a complete, professional document in clear sections (Purpose, Scope, Roles & Responsibilities, Procedure, Controls, Review). Use plain markdown. No preamble. ${ctxBlock}`
        : `You are Complee, an expert FinTech regulatory compliance assistant. Help the user understand the requirement, draft policy text, fill out compliance forms, and explain regulator expectations in plain language. Be concise and concrete. Use markdown.${ctxBlock}`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [{ role: "system", content: systemPrompt }, ...messages],
          stream: true,
        }),
      },
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded, try again shortly." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({
            error: "AI credits exhausted. Add credits in Lovable workspace settings.",
          }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("complee-ai error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
