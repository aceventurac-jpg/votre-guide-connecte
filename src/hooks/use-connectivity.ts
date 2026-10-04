import { useEffect, useState } from "react";

export type NetState = "CONNECTING" | "ONLINE" | "DEGRADED" | "OFFLINE";
export type GeoState = "AVAILABLE" | "DENIED" | "ASK" | "UNSUPPORTED";

/** Real connectivity: browser network + SocialTown server heartbeat every 15 s. */
export function useConnectivity() {
  const [net, setNet] = useState<NetState>("CONNECTING");
  const [latency, setLatency] = useState<number | null>(null);
  const [geo, setGeo] = useState<GeoState>("ASK");

  useEffect(() => {
    let alive = true;
    async function ping() {
      if (!navigator.onLine) { if (alive) setNet("OFFLINE"); return; }
      const t0 = performance.now();
      try {
        const ctrl = new AbortController();
        const to = setTimeout(() => ctrl.abort(), 5000);
        const r = await fetch("/api/public/health", { cache: "no-store", signal: ctrl.signal });
        clearTimeout(to);
        const ms = Math.round(performance.now() - t0);
        if (!alive) return;
        setLatency(ms);
        setNet(r.ok ? (ms > 2000 ? "DEGRADED" : "ONLINE") : "DEGRADED");
      } catch {
        if (alive) setNet("OFFLINE");
      }
    }
    ping();
    const id = setInterval(ping, 15000);
    const on = () => ping();
    window.addEventListener("online", on);
    window.addEventListener("offline", on);

    if (!("geolocation" in navigator)) setGeo("UNSUPPORTED");
    else navigator.permissions?.query({ name: "geolocation" as PermissionName }).then((p) => {
      const map = () => setGeo(p.state === "granted" ? "AVAILABLE" : p.state === "denied" ? "DENIED" : "ASK");
      map(); p.onchange = map;
    }).catch(() => {});

    return () => { alive = false; clearInterval(id); window.removeEventListener("online", on); window.removeEventListener("offline", on); };
  }, []);

  return { net, latency, geo, setGeo };
}
