import { Link } from "@tanstack/react-router";
import { AGENT_META, type AgentKey } from "@/lib/agent-meta";

export function UniverseBubble({ agent, index = 0 }: { agent: AgentKey; index?: number }) {
  const meta = AGENT_META[agent];
  const Icon = meta.icon;
  return (
    <Link
      to="/chat"
      search={{ agent }}
      className="group relative flex flex-col items-center justify-center gap-3 rounded-3xl border p-5 transition hover:-translate-y-1 hover:shadow-lg animate-in fade-in slide-in-from-bottom-3"
      style={{
        background: meta.color,
        borderColor: meta.ring,
        animationDelay: `${index * 70}ms`,
        animationFillMode: "both",
        animationDuration: "500ms",
      }}
    >
      <div
        className="size-14 rounded-2xl inline-flex items-center justify-center bg-card shadow-sm group-hover:scale-110 transition"
        style={{ color: meta.accent }}
      >
        <Icon className="size-7" />
      </div>
      <div className="text-center">
        <div className="font-semibold text-sm" style={{ color: meta.accent }}>{meta.label}</div>
        <div className="text-[11px] text-muted-foreground mt-0.5">{meta.description}</div>
      </div>
    </Link>
  );
}
