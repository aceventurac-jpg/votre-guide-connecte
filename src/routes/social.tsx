import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState, useRef, useEffect } from "react";
import { Heart, MessageCircle, Share2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { listPosts } from "@/lib/community.functions";

export const Route = createFileRoute("/social")({
  head: () => ({
    meta: [
      { title: "Fil social — SocialTown" },
      { name: "description", content: "Découvre ce qui se passe près de chez toi en temps réel." },
    ],
  }),
  component: SocialPage,
});

interface Post {
  id: string;
  user_id: string;
  category: string;
  context: string;
  city?: string | null;
  content: string;
  created_at: string;
  author: { id: string; name: string | null; city: string | null; avatar_url?: string | null } | null;
  media?: any[];
  likes: number;
  comments: number;
  liked_by_me: boolean;
  mine: boolean;
}

interface PostWithUI extends Post {
  isDoubleTapped?: boolean;
  localLiked?: boolean;
  localLikes?: number;
}

function SocialFeed() {
  const listFn = useServerFn(listPosts);
  const { data } = useQuery({
    queryKey: ["posts-feed"],
    queryFn: () => listFn({ data: { category: undefined } }),
  });

  const [posts, setPosts] = useState<PostWithUI[]>([]);
  const [heartAnimation, setHeartAnimation] = useState<{ x: number; y: number; id: string } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (data?.posts) {
      setPosts(data.posts.map((p) => ({ ...p, localLiked: p.liked_by_me, localLikes: p.likes })));
    }
  }, [data?.posts]);

  function handleDoubleTap(post: Post, e: React.MouseEvent<HTMLDivElement>) {
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setHeartAnimation({ x, y, id: post.id });
    setTimeout(() => setHeartAnimation(null), 600);

    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === post.id && !p.localLiked) {
          return {
            ...p,
            localLiked: true,
            localLikes: (p.localLikes ?? 0) + 1,
            isDoubleTapped: true,
          };
        }
        return p;
      })
    );
  }

  return (
    <div ref={containerRef} className="h-screen w-screen overflow-y-scroll snap-y snap-mandatory scroll-smooth" style={{ scrollBehavior: "smooth" }}>
      {posts.map((post, idx) => (
        <div key={post.id} className="h-screen w-full flex-shrink-0 snap-start relative flex flex-col items-center justify-center bg-gradient-to-b from-background via-background to-secondary/20">
          {/* Post Content */}
          <div
            className="w-full h-full flex flex-col items-center justify-center px-4 relative cursor-pointer group"
            onDoubleClick={(e) => handleDoubleTap(post, e)}
          >
            {/* Background gradient based on content */}
            <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />

            {/* Main content card */}
            <div className="max-w-sm w-full bg-card/80 backdrop-blur-sm rounded-2xl p-6 shadow-2xl space-y-4 border border-border/50">
              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-semibold text-sm">
                  {post.author?.name?.[0]?.toUpperCase() ?? "A"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{post.author?.name ?? "Membre"}</p>
                  {post.city && <p className="text-xs text-muted-foreground truncate">{post.city}</p>}
                </div>
              </div>

              {/* Content */}
              <div className="space-y-3">
                <p className="text-lg leading-relaxed text-foreground">{post.content}</p>
                <div className="bg-secondary/50 rounded-xl p-3 text-xs text-muted-foreground flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-accent" />
                  {post.category}
                  {post.context === "professionnel" && <span className="text-accent font-medium ml-auto">PRO</span>}
                </div>
              </div>

              {/* Double-tap hint */}
              <p className="text-xs text-muted-foreground text-center">Double-tap pour liker ❤️</p>
            </div>

            {/* Heart animation */}
            {heartAnimation && heartAnimation.id === post.id && (
              <div
                className="absolute pointer-events-none animate-ping"
                style={{
                  left: heartAnimation.x,
                  top: heartAnimation.y,
                  transform: "translate(-50%, -50%)",
                }}
              >
                <Heart className="w-16 h-16 fill-[#FF6B6B] text-[#FF6B6B] drop-shadow-lg" style={{ animation: "heartBeat 0.6s ease-out" }} />
              </div>
            )}

            {/* Action buttons */}
            <div className="absolute bottom-8 right-6 flex flex-col gap-6">
              <button className="flex flex-col items-center gap-2 text-muted-foreground hover:text-accent transition">
                <div className="w-12 h-12 rounded-full bg-secondary/80 flex items-center justify-center hover:bg-secondary transition">
                  <Heart className={`w-6 h-6 ${post.localLiked ? "fill-[#FF6B6B] text-[#FF6B6B]" : ""}`} />
                </div>
                <span className="text-xs font-medium text-foreground">{post.localLikes ?? 0}</span>
              </button>
              <button className="flex flex-col items-center gap-2 text-muted-foreground hover:text-accent transition">
                <div className="w-12 h-12 rounded-full bg-secondary/80 flex items-center justify-center hover:bg-secondary transition">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <span className="text-xs font-medium text-foreground">{post.comments}</span>
              </button>
              <button className="flex flex-col items-center gap-2 text-muted-foreground hover:text-accent transition">
                <div className="w-12 h-12 rounded-full bg-secondary/80 flex items-center justify-center hover:bg-secondary transition">
                  <Share2 className="w-6 h-6" />
                </div>
              </button>
            </div>
          </div>
        </div>
      ))}

      {posts.length === 0 && (
        <div className="h-screen w-full flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="text-6xl">📱</div>
            <p className="text-lg text-muted-foreground">Pas encore de posts</p>
            <p className="text-sm text-muted-foreground">Reviens plus tard pour découvrir ce qui se passe!</p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes heartBeat {
          0% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 1;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) scale(1.5);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

function SocialPage() {
  return (
    <AppShell>
      <SocialFeed />
    </AppShell>
  );
}
