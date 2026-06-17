import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { sendChatMessage, getChatHistory, clearChatHistory } from "@/lib/chat.functions";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AGENT_META, type AgentKey, AGENT_ORDER } from "@/lib/agent-meta";
import { AssistantMessage } from "@/components/ChatMessage";
import { PublishPostDialog } from "@/components/PublishPostDialog";

const chatSearch = z.object({ agent: z.enum(AGENT_ORDER as [AgentKey, ...AgentKey[]]).optional() });

export const Route = createFileRoute("/chat")({
  head: () => ({ meta: [{ title: "Chat — Assistant Citoyen" }] }),
  validateSearch: chatSearch,
  component: ChatPage,
});

function ChatPage() {
  const qc = useQueryClient();
  const search = useSearch({ from: "/_authenticated/chat" });
  const preferred = search.agent as AgentKey | undefined;
  const fetchHistory = useServerFn(getChatHistory);
  const sendFn = useServerFn(sendChatMessage);
  const clearFn = useServerFn(clearChatHistory);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");
  const [shareState, setShareState] = useState<{ open: boolean; category?: Exclude<AgentKey, "general">; content: string }>({ open: false, content: "" });

  const { data } = useQuery({
    queryKey: ["chat-history"],
    queryFn: () => fetchHistory(),
  });

  const send = useMutation({
    mutationFn: (message: string) => sendFn({ data: { message, preferred_agent: preferred } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["chat-history"] }),
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erreur"),
  });

  const clear = useMutation({
    mutationFn: () => clearFn(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["chat-history"] }),
  });

  const messages = data?.messages ?? [];
  const preferredMeta = preferred ? AGENT_META[preferred] : null;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, send.isPending]);

  function submit() {
    const text = input.trim();
    if (!text || send.isPending) return;
    setInput("");
    send.mutate(text);
  }

  return (
    <AppShell>
      <div className="flex-1 flex flex-col max-w-3xl w-full mx-auto px-4 py-6 gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Ta conversation</h1>
            <p className="text-xs text-muted-foreground">
              {preferredMeta
                ? `Univers ${preferredMeta.label} sélectionné`
                : "L'orchestrateur choisit automatiquement l'agent adapté."}
            </p>
          </div>
          {messages.length > 0 && (
            <Button variant="ghost" size="sm" onClick={() => clear.mutate()}>
              <Trash2 className="size-4 mr-1" /> Effacer
            </Button>
          )}
        </div>

        {preferredMeta && (
          <div
            className="rounded-xl border p-3 text-sm flex items-center gap-3"
            style={{ background: preferredMeta.color, borderColor: preferredMeta.ring }}
          >
            <preferredMeta.icon className="size-5" style={{ color: preferredMeta.accent }} />
            <div>
              <div className="font-medium" style={{ color: preferredMeta.accent }}>{preferredMeta.label}</div>
              <div className="text-xs text-muted-foreground">{preferredMeta.description}</div>
            </div>
          </div>
        )}

        <div className="flex-1 space-y-4 overflow-y-auto pr-1">
          {messages.length === 0 && !send.isPending && (
            <div className="text-center py-12 text-muted-foreground">
              <Sparkles className="size-8 mx-auto mb-3 text-accent" />
              <p>Pose ta première question pour commencer.</p>
            </div>
          )}

          {messages.map((m) => {
            const isUser = m.role === "user";
            const agent = (m.agent_used as AgentKey | null) ?? null;
            const meta = agent ? AGENT_META[agent] : null;
            return (
              <div key={m.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[90%] ${isUser ? "chat-bubble-user px-4 py-3" : "chat-bubble-assistant px-4 py-3"}`}>
                  {!isUser && meta && (
                    <div
                      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium mb-2"
                      style={{ background: meta.color, color: meta.accent }}
                    >
                      <meta.icon className="size-3" /> {meta.label}
                    </div>
                  )}
                  {isUser ? (
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">{m.message}</div>
                  ) : (
                    <AssistantMessage
                      content={m.message}
                      onShare={
                        agent && agent !== "general"
                          ? () => setShareState({ open: true, category: agent as Exclude<AgentKey, "general">, content: m.message.slice(0, 1800) })
                          : undefined
                      }
                    />
                  )}
                </div>
              </div>
            );
          })}

          {send.isPending && (
            <div className="flex justify-start">
              <div className="chat-bubble-assistant px-4 py-3 text-sm text-muted-foreground">
                <span className="inline-flex gap-1">
                  <span className="size-1.5 rounded-full bg-muted-foreground animate-bounce" />
                  <span className="size-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:120ms]" />
                  <span className="size-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:240ms]" />
                </span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="border rounded-2xl bg-card p-2 flex gap-2 items-end">
          <Textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder={preferredMeta ? `Question sur ${preferredMeta.label.toLowerCase()}...` : "Pose ta question..."}
            rows={1}
            className="resize-none min-h-[44px] border-0 focus-visible:ring-0 shadow-none"
          />
          <Button onClick={submit} disabled={!input.trim() || send.isPending} size="icon" className="size-10 shrink-0">
            <Send className="size-4" />
          </Button>
        </div>
      </div>
      <PublishPostDialog
        open={shareState.open}
        onOpenChange={(v) => setShareState((s) => ({ ...s, open: v }))}
        defaultCategory={shareState.category}
        defaultContent={shareState.content}
      />
    </AppShell>
  );
}
