"use client";
import { useEffect, useState } from "react";
import { Download, Share, SquarePlus } from "lucide-react";
import { Button } from "@/components/ui/button";

type InstallEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> };

export function InstallCard() {
  const [deferred, setDeferred] = useState<InstallEvent | null>(null);
  const [standalone, setStandalone] = useState(false);
  const [ios, setIos] = useState(false);

  useEffect(() => {
    setStandalone(window.matchMedia("(display-mode: standalone)").matches || (navigator as any).standalone === true);
    setIos(/iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1));
    const onPrompt = (e: Event) => { e.preventDefault(); setDeferred(e as InstallEvent); };
    const onInstalled = () => { setDeferred(null); setStandalone(true); };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => { window.removeEventListener("beforeinstallprompt", onPrompt); window.removeEventListener("appinstalled", onInstalled); };
  }, []);

  return (
    <div className="rounded-xl border border-border bg-surface p-4 text-sm">
      {standalone ? (
        <p className="text-muted">TaskFlow is installed and running as an app.</p>
      ) : deferred ? (
        <div className="space-y-3">
          <p className="text-muted">Install TaskFlow on this device for a full-screen, app-like experience.</p>
          <Button onClick={async () => { await deferred.prompt(); await deferred.userChoice; setDeferred(null); }} className="max-md:h-11">
            <Download className="h-4 w-4" /> Install app
          </Button>
        </div>
      ) : ios ? (
        <ol className="space-y-2 text-muted">
          <li className="flex items-start gap-2"><Share className="mt-0.5 h-4 w-4 shrink-0" /> Open TaskFlow in <b className="text-ink">Safari</b> and tap the <b className="text-ink">Share</b> button.</li>
          <li className="flex items-start gap-2"><SquarePlus className="mt-0.5 h-4 w-4 shrink-0" /> Choose <b className="text-ink">Add to Home Screen</b>, then <b className="text-ink">Add</b>.</li>
        </ol>
      ) : (
        <p className="text-muted">To install, open your browser menu and choose <b className="text-ink">Install app</b> or <b className="text-ink">Add to Home screen</b>.</p>
      )}
    </div>
  );
}
