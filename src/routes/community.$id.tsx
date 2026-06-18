import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { listPosts, listComments, addComment, togglePostLike, deletePost, deleteComment } from "@/lib/community.functions";
import { POST_CATEGORY_META, type PostCategoryKey } from "@/lib/agent-meta";
import { Sparkles } from "lucide-react";
import { useIsAuthed } from "@/hooks/use-auth";
import { Heart, MessageSquare, ArrowLeft, Trash2, LogIn } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/community/$id")({
  head: () => ({ meta: [{ title: "Publication — Communauté" }] }),
  component: PostDetail,
});

function PostDetail() {
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { authed } = useIsAuthed();
  const listFn = useServerFn(listPosts);
  const commentsFn = useServerFn(listComments);
  const addFn = useServerFn(addComment);
  const likeFn = useServerFn(togglePostLike);
  const delPostFn = useServerFn(deletePost);
  const delCommentFn = useServerFn(deleteComment);
  const [text, setText] = useState("");

  function requireAuth() { if (!authed) { navigate({ to: "/auth" }); return false; } return true; }


  // Fetch via listPosts (cheap; gives enriched info). Filter client-side.
  const { data: postsData } = useQuery({
    queryKey: ["posts", "all-for-detail"],
    queryFn: () => listFn({ data: { limit: 50 } }),
  });
  const post = postsData?.posts.find((p) => p.id === id);

  const { data: cmtData } = useQuery({
    queryKey: ["post-comments", id],
    queryFn: () => commentsFn({ data: { post_id: id } }),
  });

  const like = useMutation({
    mutationFn: () => likeFn({ data: { post_id: id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["posts"] }),
  });
  const add = useMutation({
    mutationFn: () => addFn({ data: { post_id: id, content: text.trim() } }),
    onSuccess: () => {
      setText("");
      qc.invalidateQueries({ queryKey: ["post-comments", id] });
      qc.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erreur"),
  });
  const delPost = useMutation({
    mutationFn: () => delPostFn({ data: { id } }),
    onSuccess: () => {
      toast.success("Publication supprimée");
      qc.invalidateQueries({ queryKey: ["posts"] });
      history.back();
    },
  });
  const delC = useMutation({
    mutationFn: (cid: string) => delCommentFn({ data: { id: cid } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["post-comments", id] }),
  });

  if (!post) {
    return (
      <AppShell>
        <div className="max-w-2xl w-full mx-auto px-4 py-6 space-y-4">
          <Link to="/community" className="text-sm text-muted-foreground inline-flex items-center gap-1"><ArrowLeft className="size-4" /> Communauté</Link>
          <p className="text-sm text-muted-foreground">Publication introuvable ou supprimée.</p>
        </div>
      </AppShell>
    );
  }

  const meta = POST_CATEGORY_META[post.category as PostCategoryKey] ?? { label: "Général", icon: Sparkles };
  const Icon = meta.icon;
  const comments = cmtData?.comments ?? [];

  return (
    <AppShell>
      <div className="max-w-2xl w-full mx-auto px-4 py-6 space-y-5">
        <Link to="/community" className="text-sm text-muted-foreground inline-flex items-center gap-1 hover:text-foreground">
          <ArrowLeft className="size-4" /> Retour à la communauté
        </Link>

        <Card className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-secondary">
              <Icon className="size-3" /> {meta.label}
            </span>
            <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
              {post.context === "professionnel" ? "Pro" : "Loisirs"}
            </span>
          </div>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>
          <div className="flex items-center justify-between pt-2 border-t text-xs text-muted-foreground">
            <span>{post.author?.name || "Membre"}{post.author?.city ? ` · ${post.author.city}` : ""}</span>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => requireAuth() && like.mutate()} className="h-7 px-2 text-xs">
                <Heart className={`size-3.5 mr-1 ${post.liked_by_me ? "fill-current text-accent" : ""}`} /> {post.likes}
              </Button>
              {post.mine && (
                <Button variant="ghost" size="sm" onClick={() => delPost.mutate()} className="h-7 px-2 text-xs text-destructive">
                  <Trash2 className="size-3.5" />
                </Button>
              )}
            </div>
          </div>
        </Card>

        <div className="space-y-3">
          <h2 className="text-sm font-semibold flex items-center gap-2"><MessageSquare className="size-4" /> Commentaires ({comments.length})</h2>
          {authed === false ? (
            <Link to="/auth" className="block">
              <Button variant="outline" className="w-full"><LogIn className="size-4 mr-2" /> Connecte-toi pour commenter</Button>
            </Link>
          ) : (
            <form
              className="flex gap-2 items-end"
              onSubmit={(e) => { e.preventDefault(); if (text.trim() && requireAuth()) add.mutate(); }}
            >
              <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={2} placeholder="Ajouter un commentaire..." className="resize-none" />
              <Button type="submit" disabled={!text.trim() || add.isPending}>Envoyer</Button>
            </form>
          )}
          <div className="space-y-2">
            {comments.map((c) => (
              <Card key={c.id} className="p-3 text-sm space-y-1">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{c.author?.name || "Membre"}</span>
                  {c.mine && (
                    <Button variant="ghost" size="sm" onClick={() => delC.mutate(c.id)} className="h-6 px-1 text-xs">
                      <Trash2 className="size-3" />
                    </Button>
                  )}
                </div>
                <p className="whitespace-pre-wrap">{c.content}</p>
              </Card>
            ))}
            {comments.length === 0 && <p className="text-xs text-muted-foreground">Aucun commentaire pour le moment.</p>}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
