import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Camera, ImagePlus, Loader2, X } from "lucide-react";
import { uploadMedia, type UploadedMedia } from "@/lib/upload";
import { toast } from "sonner";

export function MediaPicker({
  value,
  onChange,
  max = 4,
  maxVideoSeconds = 60,
  label = "Photos ou vidéo",
}: {
  value: UploadedMedia[];
  onChange: (v: UploadedMedia[]) => void;
  max?: number;
  maxVideoSeconds?: number;
  label?: string;
}) {
  const galleryRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [previews, setPreviews] = useState<Record<string, string>>({});

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    try {
      const room = max - value.length;
      const picked = Array.from(files).slice(0, Math.max(room, 0));
      const uploaded: UploadedMedia[] = [];
      const localPreviews: Record<string, string> = {};
      for (const f of picked) {
        const m = await uploadMedia(f, maxVideoSeconds);
        uploaded.push(m);
        localPreviews[m.path] = URL.createObjectURL(f);
      }
      setPreviews((p) => ({ ...p, ...localPreviews }));
      onChange([...value, ...uploaded]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Envoi impossible");
    } finally {
      setBusy(false);
      if (galleryRef.current) galleryRef.current.value = "";
      if (cameraRef.current) cameraRef.current.value = "";
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm font-medium">{label}</span>
        <Button type="button" size="sm" variant="outline" disabled={busy || value.length >= max} onClick={() => galleryRef.current?.click()}>
          {busy ? <Loader2 className="size-4 animate-spin" /> : <ImagePlus className="size-4" />}
          <span className="ml-1">Galerie</span>
        </Button>
        <Button type="button" size="sm" variant="outline" disabled={busy || value.length >= max} onClick={() => cameraRef.current?.click()}>
          <Camera className="size-4" /> <span className="ml-1">Caméra</span>
        </Button>
        <span className="text-xs text-muted-foreground">vidéo {maxVideoSeconds} s max</span>
      </div>
      <input ref={galleryRef} type="file" accept="image/*,video/*" multiple hidden onChange={(e) => handleFiles(e.target.files)} />
      <input ref={cameraRef} type="file" accept="video/*,image/*" capture="environment" hidden onChange={(e) => handleFiles(e.target.files)} />
      {value.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {value.map((m) => (
            <div key={m.path} className="relative size-20 rounded-lg overflow-hidden bg-muted">
              {m.type === "image" ? (
                previews[m.path] ? <img src={previews[m.path]} alt="" className="size-full object-cover" /> : null
              ) : (
                <video src={previews[m.path]} muted className="size-full object-cover" />
              )}
              <button
                type="button"
                aria-label="Retirer"
                onClick={() => onChange(value.filter((v) => v.path !== m.path))}
                className="absolute top-0.5 right-0.5 rounded-full bg-background/80 p-0.5"
              >
                <X className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
