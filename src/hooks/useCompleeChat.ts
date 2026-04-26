// Streaming chat hook against /functions/v1/complee-ai
import { useCallback, useRef, useState } from "react";

export interface ChatMsg {
  role: "user" | "assistant";
  content: string;
}

export interface ChatContext {
  requirement_title?: string;
  regulator?: string;
  description?: string;
  company_name?: string;
  home_country?: string;
  target_country?: string;
  institution_type?: string;
}

const URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/complee-ai`;

export function useCompleeChat() {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const reset = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  const send = useCallback(
    async (
      userText: string,
      context?: ChatContext,
      mode?: "chat" | "draft_policy",
    ): Promise<string> => {
      setError(null);
      const userMsg: ChatMsg = { role: "user", content: userText };
      const next = [...messages, userMsg];
      setMessages(next);
      setStreaming(true);

      const ctrl = new AbortController();
      abortRef.current = ctrl;

      let assistant = "";
      const upsert = (chunk: string) => {
        assistant += chunk;
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant") {
            return prev.map((m, i) =>
              i === prev.length - 1 ? { ...m, content: assistant } : m,
            );
          }
          return [...prev, { role: "assistant", content: assistant }];
        });
      };

      try {
        const resp = await fetch(URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ messages: next, context, mode }),
          signal: ctrl.signal,
        });

        if (!resp.ok) {
          let msg = `Error ${resp.status}`;
          try {
            const j = await resp.json();
            msg = j.error ?? msg;
          } catch { /* ignore */ }
          setError(msg);
          setStreaming(false);
          return "";
        }
        if (!resp.body) {
          setStreaming(false);
          return "";
        }

        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let buf = "";
        let done = false;

        while (!done) {
          const { done: rDone, value } = await reader.read();
          if (rDone) break;
          buf += decoder.decode(value, { stream: true });

          let nl: number;
          while ((nl = buf.indexOf("\n")) !== -1) {
            let line = buf.slice(0, nl);
            buf = buf.slice(nl + 1);
            if (line.endsWith("\r")) line = line.slice(0, -1);
            if (line.startsWith(":") || line.trim() === "") continue;
            if (!line.startsWith("data: ")) continue;
            const json = line.slice(6).trim();
            if (json === "[DONE]") {
              done = true;
              break;
            }
            try {
              const parsed = JSON.parse(json);
              const delta = parsed.choices?.[0]?.delta?.content as
                | string
                | undefined;
              if (delta) upsert(delta);
            } catch {
              buf = line + "\n" + buf;
              break;
            }
          }
        }
        setStreaming(false);
        return assistant;
      } catch (e) {
        if ((e as Error).name === "AbortError") {
          setStreaming(false);
          return assistant;
        }
        setError(e instanceof Error ? e.message : String(e));
        setStreaming(false);
        return assistant;
      }
    },
    [messages],
  );

  const stop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  return { messages, streaming, error, send, stop, reset, setMessages };
}
