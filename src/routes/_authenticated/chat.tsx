import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { sendChatMessage, getChatHistory, clearChatHistory } from "@/lib/chat.functions";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Sparkles, Trash2, FileText, Stethoscope, Plane, Wrench, Globe2, GraduationCap } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/chat")({
  head: () => ({ meta: [{ title: "Chat — Assistant Citoyen" }] }),
  component: ChatPage,
});

const AGENT_META = {
  administratif: { label: "Administratif", icon: FileText },
  sante: { label: "Santé", icon: Stethoscope },
  voyage: { label: "Voyage", icon: Plane },
  services_locaux: { label: "Services Locaux", icon: Wrench },
  commerce_international: { label: "Commerce International", icon: Globe2 },
  apprentissage: { label: "Apprentissage", icon: GraduationCap },
  general: { label: "Général", icon: Sparkles },
} as const;
type AgentKey = keyof typeof AGENT_META;

function ChatPage() {
  const qc = useQueryClient();
  const fetchHistory = useServerFn(getChatHistory);
  const sendFn = useServerFn(sendChatMessage);
  const clearFn = useServerFn(clearChatHistory);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");

  const { data } = useQuery({
    queryKey: ["chat-history"],
    queryFn: () => fetchHistory(),
  });

  const send = useMutation({
    mutationFn: (message: string) => sendFn({ data: { message } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["chat-history"] }),
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erreur"),
  });

  const clear = useMutation({
    mutationFn: () => clearFn(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["chat-history"] }),
  });

  const messages = data?.messages ?? [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, send.isPending]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [send.isPending]);

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
            <p className="text-xs text-muted-foreground">L'orchestrateur choisit automatiquement l'agent adapté.</p>
          </div>
          {messages.length > 0 && (
            <Button variant="ghost" size="sm" onClick={() => clear.mutate()}>
              <Trash2 className="size-4 mr-1" /> Effacer
            </Button>
          )}
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto pr-1">
          {messages.length === 0 && !send.isPending && (
            <div className="text-center py-12 text-muted-foreground">
              <Sparkles className="size-8 mx-auto mb-3 text-accent" />
              <p>Pose ta première question pour commencer.</p>
              <div className="mt-4 flex flex-wrap gap-2 justify-center">
                {[
                  "Comment renouveler ma carte d'identité ?",
                  "Préparer mon voyage à Lisbonne",
                  "Aide aux devoirs : fractions CM2",
                ].map((s) => (
                  <button
                    key={s}
                    className="px-3 py-1.5 rounded-full border text-xs hover:bg-secondary"
                    onClick={() => setInput(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m) => {
            const isUser = m.role === "user";
            const agent = (m.agent_used as AgentKey | null) ?? null;
            const meta = agent ? AGENT_META[agent] : null;
            return (
              <div key={m.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] ${isUser ? "chat-bubble-user" : "chat-bubble-assistant"} px-4 py-3`}>
                  {!isUser && meta && (
                    <div className="badge-agent mb-2">
                      <meta.icon className="size-3" /> {meta.label}
                    </div>
                  )}
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">{m.message}</div>
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
            placeholder="Pose ta question..."
            rows={1}
            className="resize-none min-h-[44px] border-0 focus-visible:ring-0 shadow-none"
          />
          <Button onClick={submit} disabled={!input.trim() || send.isPending} size="icon" className="size-10 shrink-0">
            <Send className="size-4" />
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
