import { useEffect, useRef, useState } from "react";
import { Loader2, Send, Sparkles, Square, Trash2 } from "lucide-react";
import { useCompleeChat, type ChatContext } from "@/hooks/useCompleeChat";

interface Props {
  context: ChatContext;
  /** Called when user clicks "Use as draft" on an assistant message */
  onUseDraft?: (text: string) => void;
}

export function ChatPanel({ context, onUseDraft }: Props) {
  const { messages, send, stop, streaming, error, reset } = useCompleeChat();
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const t = input.trim();
    if (!t || streaming) return;
    setInput("");
    void send(t, context, "chat");
  };

  const draftPolicy = () => {
    if (streaming) return;
    void send(
      `Draft a complete policy/procedure document for: "${context.requirement_title}". Include Purpose, Scope, Roles & Responsibilities, Procedure, Controls, and Review sections.`,
      context,
      "draft_policy",
    );
  };

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden flex flex-col h-[420px]">
      <div className="px-3.5 py-2.5 border-b border-border flex items-center justify-between bg-surface-muted">
        <div className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-navy">
          <Sparkles className="h-3.5 w-3.5 text-brand" />
          Complee Assistant
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={draftPolicy}
            disabled={streaming}
            className="text-[11px] font-medium text-brand hover:text-brand/80 disabled:opacity-50"
          >
            Draft policy
          </button>
          {messages.length > 0 && (
            <button
              type="button"
              onClick={reset}
              className="ml-2 text-muted-foreground hover:text-foreground"
              aria-label="Clear chat"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3.5 py-3 space-y-3">
        {messages.length === 0 && (
          <div className="text-[12px] text-muted-foreground">
            Ask anything about this requirement, or click <span className="font-medium text-navy">Draft policy</span> to generate a starter document.
          </div>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`text-[12.5px] leading-relaxed ${
              m.role === "user" ? "text-navy" : "text-foreground"
            }`}
          >
            <div className="text-[10px] uppercase tracking-[0.08em] font-semibold text-muted-foreground mb-1">
              {m.role === "user" ? "You" : "Assistant"}
            </div>
            <div
              className={`whitespace-pre-wrap rounded-lg px-3 py-2 ${
                m.role === "user"
                  ? "bg-brand-soft/40 text-navy"
                  : "bg-surface-muted"
              }`}
            >
              {m.content || (streaming ? "…" : "")}
            </div>
            {m.role === "assistant" && m.content && onUseDraft && !streaming && (
              <button
                type="button"
                onClick={() => onUseDraft(m.content)}
                className="mt-1 text-[11px] font-medium text-brand hover:text-brand/80"
              >
                Use as document body →
              </button>
            )}
          </div>
        ))}
        {error && (
          <div className="text-[11.5px] text-danger bg-danger-soft border border-danger/30 rounded-md px-2.5 py-1.5">
            {error}
          </div>
        )}
      </div>

      <form
        onSubmit={submit}
        className="border-t border-border p-2.5 flex items-end gap-2"
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          rows={1}
          placeholder="Ask about this requirement…"
          className="flex-1 resize-none rounded-md border border-border bg-card px-2.5 py-2 text-[12.5px] focus:outline-none focus:ring-2 focus:ring-brand/40 max-h-32"
        />
        {streaming ? (
          <button
            type="button"
            onClick={stop}
            className="inline-flex items-center justify-center h-9 w-9 rounded-md bg-muted text-muted-foreground hover:bg-surface-muted"
            aria-label="Stop"
          >
            <Square className="h-3.5 w-3.5" />
          </button>
        ) : (
          <button
            type="submit"
            disabled={!input.trim()}
            className="inline-flex items-center justify-center h-9 w-9 rounded-md bg-brand text-brand-foreground hover:bg-brand/90 disabled:opacity-40"
            aria-label="Send"
          >
            {streaming ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
          </button>
        )}
      </form>
    </div>
  );
}
