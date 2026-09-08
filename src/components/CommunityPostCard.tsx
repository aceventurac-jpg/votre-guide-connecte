import { Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Heart, MessageSquare, MapPin } from "lucide-react";
import { POST_CATEGORY_META, type PostCategoryKey } from "@/lib/agent-meta";
import { Sparkles } from "lucide-react";
import { MediaStrip, type PostMediaItem } from "@/components/PostMedia";

export type CommunityPost = {
  id: string;
  user_id: string;
  category: string;
  context: string;
  city?: string | null;
  content: string;
  created_at: string;
  author: { id: string; name: string | null; city: string | null; avatar_url?: string | null } | null;
  media?: PostMediaItem[];
  likes: number;
  comments: number;
  liked_by_me: boolean;
  mine: boolean;
};

export function CommunityPostCard({ post }: { post: CommunityPost }) {
  const meta = POST_CATEGORY_META[post.category as PostCategoryKey] ?? { label: "Général", icon: Sparkles };
  const Icon = meta.icon;
  return (
    <Link to="/community/$id" params={{ id: post.id }} className="block">
      <Card className="p-4 space-y-2 hover:border-accent transition">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-secondary">
            <Icon className="size-3" /> {meta.label}
          </span>
          <div className="flex items-center gap-1.5">
            {post.city && (
              <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent">
                <MapPin className="size-3" /> {post.city}
              </span>
            )}
            <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
              {post.context === "professionnel" ? "Pro" : "Loisirs"}
            </span>
          </div>
        </div>
        <p className="text-sm leading-relaxed line-clamp-3 whitespace-pre-wrap">{post.content}</p>
        {post.media && post.media.length > 0 && <MediaStrip media={post.media} />}
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
