import "./globals.css";
import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { RegisterServiceWorker } from "@/components/pwa/register-sw";

export const metadata: Metadata = {
  title: "TaskFlow",
  applicationName: "TaskFlow",
  description: "A fast, focused place to manage your tasks and projects.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "TaskFlow", statusBarStyle: "default" },
  formatDetection: { telephone: false },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover", // lets env(safe-area-inset-*) work on notched iPhones
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafc" },
    { media: "(prefers-color-scheme: dark)", color: "#0f0f13" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
          {/* On phones, lift toasts above the bottom nav + home indicator so they never cover it. */}
          <Toaster position="bottom-right" mobileOffset={{ bottom: "calc(env(safe-area-inset-bottom) + 84px)", left: 12, right: 12 }} richColors closeButton />
        </ThemeProvider>
        <RegisterServiceWorker />
      </body>
    </html>
  );
}
