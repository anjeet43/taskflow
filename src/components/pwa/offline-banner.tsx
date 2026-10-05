"use client";
import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

/** Honest offline state: TaskFlow does not queue writes, so tell the user instead of pretending a save worked. */
export function OfflineBanner() {
  const [online, setOnline] = useState(true);
  useEffect(() => {
    setOnline(navigator.onLine);
    const up = () => setOnline(true);
    const down = () => setOnline(false);
    window.addEventListener("online", up);
    window.addEventListener("offline", down);
    return () => { window.removeEventListener("online", up); window.removeEventListener("offline", down); };
  }, []);
  if (online) return null;
  return (
    <div role="status" className="sticky top-0 z-20 flex items-center justify-center gap-2 bg-warn px-3 py-2 text-center text-xs font-medium text-white">
      <WifiOff className="h-3.5 w-3.5 shrink-0" />
      You&apos;re offline. Changes can&apos;t be saved until you reconnect.
    </div>
  );
}
