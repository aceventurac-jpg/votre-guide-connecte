import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

export type PostMediaItem = { id: string; type: string; url: string };

/** Video that autoplays muted when visible, sound toggled by tap. */
export function AutoVideo({ src, className = "" }: { src: string; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) void el.play().catch(() => {});
          else el.pause();
        });
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div className="relative size-full">
      <video
        ref={ref}
        src={src}
        muted={muted}
        loop
        playsInline
        preload="metadata"
        className={`size-full object-cover ${className}`}
      />
      <button
        type="button"
        aria-label={muted ? "Activer le son" : "Couper le son"}
        onClick={(e) => { e.stopPropagation(); setMuted((m) => !m); }}
        className="absolute bottom-3 left-3 rounded-full bg-background/70 backdrop-blur p-2"
      >
        {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
      </button>
    </div>
  );
}

/** Compact media strip used inside community cards. */
export function MediaStrip({ media }: { media: PostMediaItem[] }) {
  if (!media.length) return null;
  return (
    <div className={`grid gap-1 rounded-xl overflow-hidden ${media.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
      {media.slice(0, 4).map((m) => (
        <div key={m.id} className="aspect-video bg-muted">
          {m.type === "video" ? <AutoVideo src={m.url} /> : <img src={m.url} alt="" loading="lazy" className="size-full object-cover" />}
        </div>
      ))}
    </div>
  );
}
