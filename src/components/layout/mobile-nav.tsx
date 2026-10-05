"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  Inbox, CalendarDays, Plus, CalendarRange, FolderKanban, Menu, CheckCircle2, Calendar, Settings, Search, Command, LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkspace } from "@/components/workspace-context";
import { createClient } from "@/lib/supabase/client";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

const TABS = [
  { href: "/today", label: "Today", icon: CalendarDays },
  { href: "/inbox", label: "Inbox", icon: Inbox },
  { href: "/upcoming", label: "Upcoming", icon: CalendarRange },
  { href: "/projects", label: "Projects", icon: FolderKanban },
];

// Everything the desktop sidebar offers that doesn't fit in the 4 primary tabs.
const MORE_LINKS = [
  { href: "/completed", label: "Completed", icon: CheckCircle2 },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { setQuickAddOpen, setSearchOpen, setPaletteOpen } = useWorkspace();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreActive = MORE_LINKS.some((l) => pathname === l.href);

  async function signOut() {
    await createClient().auth.signOut();
    setMoreOpen(false);
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-30 flex items-stretch border-t border-border bg-surface/95 px-1 pb-[env(safe-area-inset-bottom,0px)] backdrop-blur md:hidden"
      >
        {TABS.slice(0, 2).map(({ href, label, icon: Icon }) => (
          <Tab key={href} href={href} label={label} Icon={Icon} active={pathname === href} />
        ))}
        <div className="flex h-14 w-16 shrink-0 items-center justify-center">
          <button
            onClick={() => setQuickAddOpen(true)}
            className="flex h-12 w-12 -translate-y-3 items-center justify-center rounded-full bg-accent text-accent-ink shadow-lg ring-4 ring-surface transition-transform active:-translate-y-3 active:scale-95 focus-visible:outline-none focus-visible:ring-accent/50"
            aria-label="Add task"
          >
            <Plus className="h-6 w-6" />
          </button>
        </div>
        {TABS.slice(2).map(({ href, label, icon: Icon }) => (
          <Tab key={href} href={href} label={label} Icon={Icon} active={pathname === href || pathname.startsWith(`${href}/`)} />
        ))}
        <button
          onClick={() => setMoreOpen(true)}
          aria-label="More"
          aria-haspopup="dialog"
          className={cn(
            "flex h-14 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-0 text-[10px] leading-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50",
            moreActive ? "text-accent" : "text-muted"
          )}
        >
          <Menu className="h-5 w-5" />
          More
        </button>
      </nav>

      <Dialog open={moreOpen} onOpenChange={setMoreOpen}>
        <DialogContent
          aria-describedby={undefined}
          // Bottom sheet on phones: this one has no text input, so anchoring to the thumb is safe.
          className="max-md:bottom-0 max-md:left-0 max-md:right-0 max-md:top-auto max-md:rounded-b-none max-md:pb-[calc(1rem+env(safe-area-inset-bottom))]"
        >
          <DialogTitle>Menu</DialogTitle>
          <div className="mt-3 grid gap-1">
            <SheetButton icon={Search} onClick={() => { setMoreOpen(false); setSearchOpen(true); }}>Search</SheetButton>
            <SheetButton icon={Command} onClick={() => { setMoreOpen(false); setPaletteOpen(true); }}>Command palette</SheetButton>
            <div className="my-1 h-px bg-border" />
            {MORE_LINKS.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMoreOpen(false)}
                aria-current={pathname === href ? "page" : undefined}
                className={cn(
                  "flex min-h-12 items-center gap-3 rounded-xl px-3 text-[15px] hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50",
                  pathname === href ? "bg-accent/10 font-medium text-accent" : "text-ink"
                )}
              >
                <Icon className="h-5 w-5" /> {label}
              </Link>
            ))}
            <div className="my-1 h-px bg-border" />
            <SheetButton icon={LogOut} onClick={signOut} muted>Sign out</SheetButton>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function SheetButton({ icon: Icon, onClick, children, muted }: { icon: typeof Search; onClick: () => void; children: React.ReactNode; muted?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex min-h-12 items-center gap-3 rounded-xl px-3 text-left text-[15px] hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50",
        muted ? "text-muted" : "text-ink"
      )}
    >
      <Icon className="h-5 w-5" /> {children}
    </button>
  );
}

function Tab({ href, label, Icon, active }: { href: string; label: string; Icon: typeof Inbox; active: boolean }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex h-14 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-0 text-[10px] leading-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50",
        active ? "text-accent" : "text-muted"
      )}
    >
      <Icon className="h-5 w-5" />
      <span className="whitespace-nowrap">{label}</span>
    </Link>
  );
}
