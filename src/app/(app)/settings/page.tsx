"use client";
import { PageHeader } from "@/components/layout/page-header";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { SunMedium, Moon, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
  }, []);

  return (
    <div>
      <PageHeader title="Settings" />
      <div className="mx-auto max-w-lg space-y-8 px-5 py-6 md:px-8">
        <section>
          <h2 className="mb-2 text-sm font-medium text-ink">Account</h2>
          <div className="rounded-xl border border-border bg-surface p-4">
            <p className="text-sm text-muted">Signed in as</p>
            <p className="text-sm font-medium">{email ?? "…"}</p>
          </div>
        </section>

        <section>
          <h2 className="mb-2 text-sm font-medium text-ink">Appearance</h2>
          <div className="flex gap-2">
            {([["light", SunMedium, "Light"], ["dark", Moon, "Dark"], ["system", Monitor, "System"]] as const).map(([value, Icon, label]) => (
              <Button
                key={value}
                variant={theme === value ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme(value)}
                className={cn(theme === value && "shadow-sm")}
              >
                <Icon className="h-4 w-4" /> {label}
              </Button>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-2 text-sm font-medium text-ink">Keyboard shortcuts</h2>
          <div className="space-y-1.5 rounded-xl border border-border bg-surface p-4 text-sm">
            {[["N", "New task"], ["/", "Search"], ["⌘ / Ctrl + K", "Command palette"], ["Esc", "Close dialog"]].map(([key, label]) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-muted">{label}</span>
                <kbd className="rounded-md bg-surface-2 px-2 py-0.5 text-xs">{key}</kbd>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
