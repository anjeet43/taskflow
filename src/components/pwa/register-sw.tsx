"use client";
import { useEffect } from "react";

/** Registers the service worker in production only (avoids stale-cache confusion during `next dev`). */
export function RegisterServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {
      /* non-fatal: the app works normally without a service worker */
    });
  }, []);
  return null;
}
