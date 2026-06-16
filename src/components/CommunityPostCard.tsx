import { Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Heart, MessageSquare } from "lucide-react";
import { AGENT_META, type AgentKey } from "@/lib/agent-meta";

export type CommunityPost = {
  id: string;
  user_id: string;
  category: string;
  context: string;
  content: string;
  created_at: string;
  author: { id: string; name: string | null; city: string | null } | null;
  likes: number;
  comments: number;
  liked_by_me: boolean;
  mine: boolean;
};

export function CommunityPostCard({ post }: { post: CommunityPost }) {
  const meta = AGENT_META[post.category as AgentKey] ?? AGENT_META.general;
  const Icon = meta.icon;
  return (
    <Link to="/community/$id" params={{ id: post.id }} className="block">
      <Card className="p-4 space-y-2 hover:border-accent transition">
        <div className="flex items-center justify-between gap-2">
          <span
            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium"
            style={{ background: meta.color, color: meta.accent }}
          >
            <Icon className="size-3" /> {meta.label}
          </span>
          <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
            {post.context === "professionnel" ? "Pro" : "Loisirs"}
          </span>
        </div>
        <p className="text-sm leading-relaxed line-clamp-3 whitespace-pre-wrap">{post.content}</p>
        <div className="flex items-center justify-between pt-2 border-t text-xs text-muted-foreground">
          <span>{post.author?.name || "Membre"}{post.author?.city ? ` · ${post.author.city}` : ""}</span>
          <span className="flex items-center gap-3">
            <span className={`flex items-center gap-1 ${post.liked_by_me ? "text-accent" : ""}`}>
              <Heart className={`size-3.5 ${post.liked_by_me ? "fill-current" : ""}`} /> {post.likes}
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare className="size-3.5" /> {post.comments}
            </span>
          </span>
        </div>
      </Card>
    </Link>
  );
}
