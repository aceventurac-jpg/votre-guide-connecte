import { supabase } from "@/integrations/supabase/client";

export type UploadedMedia = { type: "image" | "video"; path: string };

export const MAX_POST_VIDEO_SECONDS = 60;
export const MAX_STORY_VIDEO_SECONDS = 15;

export function mediaKind(file: File): "image" | "video" | null {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";
  return null;
}

/** Reads a local video duration before upload (0 when unknown). */
export function videoDuration(file: File): Promise<number> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const v = document.createElement("video");
    v.preload = "metadata";
    v.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve(Number.isFinite(v.duration) ? v.duration : 0);
    };
    v.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(0);
    };
    v.src = url;
  });
}

/** Uploads to the private media bucket under <userId>/... and returns the stored path. */
export async function uploadMedia(file: File, maxVideoSeconds = MAX_POST_VIDEO_SECONDS): Promise<UploadedMedia> {
  const kind = mediaKind(file);
  if (!kind) throw new Error("Format non pris en charge (photo ou vidéo uniquement).");
  if (file.size > 50 * 1024 * 1024) throw new Error("Fichier trop lourd (50 Mo maximum).");
  if (kind === "video") {
    const d = await videoDuration(file);
    if (d && d > maxVideoSeconds + 0.5) {
      throw new Error(`Vidéo trop longue : ${Math.round(d)} s (maximum ${maxVideoSeconds} s).`);
    }
  }
  const { data: userData } = await supabase.auth.getUser();
  const uid = userData.user?.id;
  if (!uid) throw new Error("Connecte-toi pour envoyer un média.");
  const ext = (file.name.split(".").pop() || (kind === "video" ? "mp4" : "jpg")).toLowerCase().slice(0, 5);
  const path = `${uid}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("media").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type || undefined,
  });
  if (error) throw new Error(error.message);
  return { type: kind, path };
}
