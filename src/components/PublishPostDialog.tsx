import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AGENT_META, AGENT_ORDER, type AgentKey } from "@/lib/agent-meta";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPost } from "@/lib/community.functions";
import { toast } from "sonner";

type PostCategory = Exclude<AgentKey, "general">;

export function PublishPostDialog({
  open,
  onOpenChange,
  defaultCategory,
  defaultContent = "",
  defaultContext = "loisirs",
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  defaultCategory?: PostCategory;
  defaultContent?: string;
  defaultContext?: "loisirs" | "professionnel";
}) {
  const [category, setCategory] = useState<PostCategory>(defaultCategory ?? "administratif");
  const [ctx, setCtx] = useState<"loisirs" | "professionnel">(defaultContext);
  const [content, setContent] = useState(defaultContent);

  useEffect(() => {
    if (open) {
      setCategory(defaultCategory ?? "administratif");
      setCtx(defaultContext);
      setContent(defaultContent);
    }
  }, [open, defaultCategory, defaultContent, defaultContext]);

  const qc = useQueryClient();
  const createFn = useServerFn(createPost);
  const m = useMutation({
    mutationFn: () => createFn({ data: { category, context: ctx, content: content.trim() } }),
    onSuccess: () => {
      toast.success("Publié !");
      qc.invalidateQueries({ queryKey: ["posts"] });
      qc.invalidateQueries({ queryKey: ["home-preview"] });
      onOpenChange(false);
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erreur"),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Publier dans la communauté</DialogTitle></DialogHeader>
        <form
          className="space-y-3"
          onSubmit={(e) => { e.preventDefault(); if (content.trim().length > 0) m.mutate(); }}
        >
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Univers</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as PostCategory)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {AGENT_ORDER.map((k) => (
                    <SelectItem key={k} value={k}>{AGENT_META[k].label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Contexte</Label>
              <Select value={ctx} onValueChange={(v) => setCtx(v as typeof ctx)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="loisirs">Loisirs / Particulier</SelectItem>
                  <SelectItem value="professionnel">Professionnel</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Message</Label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              minLength={1}
              maxLength={2000}
              rows={6}
              placeholder="Question, retour d'expérience, conseil..."
            />
            <p className="text-xs text-muted-foreground mt-1">{content.length}/2000</p>
          </div>
          <Button type="submit" disabled={m.isPending || !content.trim()} className="w-full">
            {m.isPending ? "..." : "Publier"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
