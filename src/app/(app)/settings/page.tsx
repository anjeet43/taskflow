"use client";
import { PageHeader } from "@/components/layout/page-header";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { SunMedium, Moon, Monitor, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { InstallCard } from "@/components/pwa/install-card";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [email, setEmail] = useState<string | null>(null);
  const router = useRouter();

  async function signOut() {
    await createClient().auth.signOut();
    router.push("/login");
    router.refresh();
  }

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
  }, []);

  return (
    <div>
      <PageHeader title="Settings" />
      <div className="mx-auto min-w-0 max-w-lg space-y-8 px-4 py-6 sm:px-5 md:px-8">
        <section>
          <h2 className="mb-2 text-sm font-medium text-ink">Account</h2>
          <div className="rounded-xl border border-border bg-surface p-4">
            <p className="text-sm text-muted">Signed in as</p>
            <p className="break-all text-sm font-medium">{email ?? "…"}</p>
            <Button variant="outline" size="sm" onClick={signOut} className="mt-3 max-md:h-11"><LogOut className="h-4 w-4" /> Sign out</Button>
          </div>
        </section>

        <section>
          <h2 className="mb-2 text-sm font-medium text-ink">Appearance</h2>
          <div className="flex flex-wrap gap-2">
            {([["light", SunMedium, "Light"], ["dark", Moon, "Dark"], ["system", Monitor, "System"]] as const).map(([value, Icon, label]) => (
              <Button
                key={value}
                variant={theme === value ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme(value)}
                aria-pressed={theme === value}
                className={cn("max-md:h-11 max-md:flex-1", theme === value && "shadow-sm")}
              >
                <Icon className="h-4 w-4" /> {label}
              </Button>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-2 text-sm font-medium text-ink">Install app</h2>
          <InstallCard />
        </section>

        <section>
          <h2 className="mb-2 text-sm font-medium text-ink">Keyboard shortcuts</h2>
          <div className="space-y-1.5 rounded-xl border border-border bg-surface p-4 text-sm">
            {[["N", "New task"], ["/", "Search"], ["⌘ / Ctrl + K", "Command palette"], ["Esc", "Close dialog"]].map(([key, label]) => (
              <div key={label} className="flex items-center justify-between gap-3">
                <span className="text-muted">{label}</span>
                <kbd className="shrink-0 rounded-md bg-surface-2 px-2 py-0.5 text-xs">{key}</kbd>
              </div>
            ))}
            <p className="pt-2 text-xs text-muted md:hidden">On a phone, use the search and command buttons in the page header, or the menu&apos;s More tab.</p>
          </div>
        </section>
      </div>
    </div>
  );
}
