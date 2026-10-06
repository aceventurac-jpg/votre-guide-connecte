import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { RefreshCw, X, Send, Zap, Settings } from "lucide-react";
import { toast } from "sonner";
import { createPost } from "@/lib/community.functions";
import { uploadMedia } from "@/lib/upload";
import { useIsAuthed } from "@/hooks/use-auth";
import { useAppSettings } from "@/lib/app-settings";

export const Route = createFileRoute("/camera")({
  head: () => ({
    meta: [
      { title: "Caméra — SocialTown" },
      { name: "description", content: "Filme ou photographie ton expérience et publie-la dans le fil SocialTown." },
      { property: "og:title", content: "Caméra — SocialTown" },
      { property: "og:description", content: "Capture instantanée et partage de ton expérience." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CameraPage,
});

const FILTERS = [
  { id: "none", label: "Normal", css: "none" },
  { id: "neon", label: "OASIS", css: "saturate(1.8) hue-rotate(-20deg) contrast(1.15)" },
  { id: "retro", label: "Arcade", css: "sepia(0.4) saturate(1.6) contrast(1.2)" },
  { id: "noir", label: "Noir", css: "grayscale(1) contrast(1.3)" },
];

function CameraPage() {
  const { global, setGlobal } = useAppSettings();
  const { authed } = useIsAuthed();
  const navigate = useNavigate();
  const post = useServerFn(createPost);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recRef = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const pressTimer = useRef<number | null>(null);
  const [facing, setFacing] = useState<"user" | "environment">("environment");
  const [error, setError] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const [filter, setFilter] = useState(FILTERS[0]);
  const [shot, setShot] = useState<{ file: File; url: string; kind: "image" | "video" } | null>(null);
  const [caption, setCaption] = useState("");
  const [busy, setBusy] = useState(false);
  const [started, setStarted] = useState(false);

  useEffect(() => { setFacing(global.frontCameraFirst ? "user" : "environment"); }, [global.frontCameraFirst]);

  async function start(f = facing) {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: f }, audio: global.autoMic });
      streamRef.current = s;
      if (videoRef.current) videoRef.current.srcObject = s;
      setError(null);
      setStarted(true);
    } catch {
      setError("Accès à la caméra refusé. Autorise-la dans ton navigateur puis réessaie.");
    }
  }

  useEffect(() => {
    if (global.autoCamera && !shot) start();
    return () => streamRef.current?.getTracks().forEach((t) => t.stop());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [global.autoCamera, facing]);

  function snap() {
    const v = videoRef.current;
    if (!v || !v.videoWidth) return;
    const c = document.createElement("canvas");
    c.width = v.videoWidth; c.height = v.videoHeight;
    const ctx = c.getContext("2d")!;
    ctx.filter = filter.css;
    if (facing === "user") { ctx.translate(c.width, 0); ctx.scale(-1, 1); }
    ctx.drawImage(v, 0, 0);
    c.toBlob((b) => {
      if (!b) return;
      const file = new File([b], `snap-${Date.now()}.jpg`, { type: "image/jpeg" });
      setShot({ file, url: URL.createObjectURL(b), kind: "image" });
    }, "image/jpeg", 0.9);
  }

  function startRec() {
    if (!streamRef.current) return;
    chunks.current = [];
    const r = new MediaRecorder(streamRef.current);
    r.ondataavailable = (e) => e.data.size && chunks.current.push(e.data);
    r.onstop = () => {
      const type = r.mimeType || "video/webm";
      const b = new Blob(chunks.current, { type });
      const file = new File([b], `clip-${Date.now()}.${type.includes("mp4") ? "mp4" : "webm"}`, { type });
      setShot({ file, url: URL.createObjectURL(b), kind: "video" });
    };
    r.start();
    recRef.current = r;
    setRecording(true);
    window.setTimeout(() => recRef.current?.state === "recording" && stopRec(), 60000);
  }
  function stopRec() { recRef.current?.stop(); setRecording(false); }

  function down() { pressTimer.current = window.setTimeout(() => { pressTimer.current = null; startRec(); }, 350); }
  function up() {
    if (pressTimer.current) { clearTimeout(pressTimer.current); pressTimer.current = null; snap(); }
    else if (recording) stopRec();
  }

  async function publish() {
    if (!shot) return;
    if (!authed) { toast.message("Connecte-toi pour publier."); navigate({ to: "/auth" }); return; }
    setBusy(true);
    try {
      const m = await uploadMedia(shot.file, 60);
      await post({ data: { category: "entraide", context: "loisirs", content: caption.trim() || "Mon expérience SocialTown ✨", media: [m] } });
      toast.success("Publié dans le fil !");
      navigate({ to: "/social" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Publication impossible");
    } finally { setBusy(false); }
  }

  return (
    <div className="fixed inset-0 z-30 bg-background flex flex-col">
      <div className="relative flex-1 overflow-hidden bg-foreground">
        {shot ? (
          shot.kind === "image"
            ? <img src={shot.url} alt="Capture" className="absolute inset-0 size-full object-cover" />
            : <video src={shot.url} autoPlay loop playsInline className="absolute inset-0 size-full object-cover" />
        ) : (
          <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 size-full object-cover"
            style={{ filter: filter.css, transform: facing === "user" ? "scaleX(-1)" : undefined }} />
        )}

        <div className="absolute top-0 inset-x-0 p-4 flex justify-between">
          <Link to="/" className="size-10 rounded-full bg-background/70 inline-flex items-center justify-center" aria-label="Fermer"><X className="size-5" /></Link>
          {!shot && (
            <div className="flex gap-2">
              <Link to="/settings" className="size-10 rounded-full bg-background/70 inline-flex items-center justify-center" aria-label="Réglages"><Settings className="size-5" /></Link>
              <button onClick={() => setFacing(facing === "user" ? "environment" : "user")} className="size-10 rounded-full bg-background/70 inline-flex items-center justify-center" aria-label="Changer de caméra"><RefreshCw className="size-5" /></button>
            </div>
          )}
        </div>

        {!shot && (error || (!started && !global.autoCamera)) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center bg-background/90">
            <p className="text-sm">{error ?? "La caméra automatique est désactivée."}</p>
            <button onClick={() => { setGlobal({ autoCamera: true }); start(); }} className="rounded-full bg-primary text-primary-foreground px-5 py-2 font-semibold inline-flex items-center gap-2"><Zap className="size-4" /> Activer la caméra</button>
          </div>
        )}

        {recording && <div className="absolute top-16 left-1/2 -translate-x-1/2 rounded-full bg-destructive text-destructive-foreground px-3 py-1 text-xs font-bold animate-pulse">● REC</div>}
      </div>

      {shot ? (
        <div className="p-4 space-y-3 bg-card">
          <input value={caption} onChange={(e) => setCaption(e.target.value)} maxLength={300} placeholder="Raconte ton expérience…" className="w-full rounded-full border bg-background px-4 py-2 text-sm" />
          <div className="flex gap-2">
            <button onClick={() => { setShot(null); start(); }} className="flex-1 rounded-full border py-2 font-medium">Reprendre</button>
            <button disabled={busy} onClick={publish} className="flex-1 rounded-full bg-primary text-primary-foreground py-2 font-semibold inline-flex items-center justify-center gap-2"><Send className="size-4" /> {busy ? "Envoi…" : "Publier"}</button>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-card space-y-3">
          <div className="flex justify-center gap-2 overflow-x-auto">
            {FILTERS.map((f) => (
              <button key={f.id} onClick={() => setFilter(f)} className={`rounded-full px-3 py-1 text-xs font-medium border ${filter.id === f.id ? "bg-primary text-primary-foreground" : ""}`}>{f.label}</button>
            ))}
          </div>
          <div className="flex justify-center">
            <button onPointerDown={down} onPointerUp={up} onPointerLeave={() => recording && stopRec()} aria-label="Appuie pour une photo, maintiens pour filmer"
              className={`size-20 rounded-full border-4 border-primary transition ${recording ? "bg-destructive scale-110" : "bg-background"}`} />
          </div>
          <p className="text-center text-xs text-muted-foreground">Appuie = photo · Maintiens = vidéo (60 s max)</p>
        </div>
      )}
    </div>
  );
}
