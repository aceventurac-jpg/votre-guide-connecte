import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { POST_CATEGORY_META, POST_CATEGORY_ORDER, type PostCategoryKey } from "@/lib/agent-meta";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPost } from "@/lib/community.functions";
import { MediaPicker } from "@/components/MediaPicker";
import type { UploadedMedia } from "@/lib/upload";
import { toast } from "sonner";

export function PublishPostDialog({
  open,
  onOpenChange,
  defaultCategory,
  defaultContent = "",
  defaultContext = "loisirs",
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  defaultCategory?: PostCategoryKey;
  defaultContent?: string;
  defaultContext?: "loisirs" | "professionnel";
}) {
  const [category, setCategory] = useState<PostCategoryKey>(defaultCategory ?? "administratif");
  const [ctx, setCtx] = useState<"loisirs" | "professionnel">(defaultContext);
  const [content, setContent] = useState(defaultContent);
  const [city, setCity] = useState("");
  const [media, setMedia] = useState<UploadedMedia[]>([]);

  useEffect(() => {
    if (open) {
      setCategory(defaultCategory ?? "administratif");
      setCtx(defaultContext);
      setContent(defaultContent);
      setCity("");
      setMedia([]);
    }
  }, [open, defaultCategory, defaultContent, defaultContext]);

  const qc = useQueryClient();
  const createFn = useServerFn(createPost);
  const m = useMutation({
    mutationFn: () =>
      createFn({
        data: {
          category,
          context: ctx,
          content: content.trim(),
          city: city.trim() || undefined,
          media: media.length ? media : undefined,
        },
      }),
    onSuccess: () => {
      toast.success("Publié !");
      qc.invalidateQueries({ queryKey: ["posts"] });
      qc.invalidateQueries({ queryKey: ["home-preview"] });
      onOpenChange(false);
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erreur"),
  });

  const showCity = category === "entraide";

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
              <Label>Catégorie</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as PostCategoryKey)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {POST_CATEGORY_ORDER.map((k) => (
                    <SelectItem key={k} value={k}>{POST_CATEGORY_META[k].label}</SelectItem>
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
          {showCity && (
            <div>
              <Label>Ville (utile pour l'entraide locale)</Label>
              <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="ex. Lyon" />
            </div>
          )}
          <div>
            <Label>Message</Label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              minLength={1}
              maxLength={2000}
              rows={6}
              placeholder="Question, retour d'expérience, conseil…"
            />
            <p className="text-xs text-muted-foreground mt-1">{content.length}/2000</p>
          </div>
          <MediaPicker value={media} onChange={setMedia} max={4} maxVideoSeconds={60} />
          <Button type="submit" disabled={m.isPending || !content.trim()} className="w-full">
            {m.isPending ? "..." : "Publier"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
