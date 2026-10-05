"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Inbox, CalendarDays, Plus, CalendarRange, FolderKanban } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkspace } from "@/components/workspace-context";

const LEFT = [
  { href: "/today", label: "Today", icon: CalendarDays },
  { href: "/inbox", label: "Inbox", icon: Inbox },
];
const RIGHT = [
  { href: "/upcoming", label: "Upcoming", icon: CalendarRange },
  { href: "/projects", label: "Projects", icon: FolderKanban },
];

// Phone navigation: 5 equal slots (2 tabs, Add, 2 tabs) that all share one height and one centre line.
// Completed, Calendar, Settings, Command palette and Sign out live in the avatar menu in the page header.
export function MobileNav() {
  const pathname = usePathname();
  const { setQuickAddOpen } = useWorkspace();

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-border bg-surface/95 pb-[env(safe-area-inset-bottom,0px)] backdrop-blur md:hidden"
    >
      {LEFT.map((t) => <Tab key={t.href} {...t} pathname={pathname} />)}
      <div className="flex h-14 items-center justify-center">
        <button
          onClick={() => setQuickAddOpen(true)}
          aria-label="Add task"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-ink shadow-md transition-transform active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
        >
          <Plus className="h-6 w-6" />
        </button>
      </div>
      {RIGHT.map((t) => <Tab key={t.href} {...t} pathname={pathname} />)}
    </nav>
  );
}

function Tab({ href, label, icon: Icon, pathname }: { href: string; label: string; icon: typeof Inbox; pathname: string }) {
  const active = pathname === href || pathname.startsWith(`${href}/`);
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex h-14 flex-col items-center justify-center gap-1 text-[11px] leading-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50",
        active ? "text-accent" : "text-muted"
      )}
    >
      <Icon className="h-5 w-5" />
      <span>{label}</span>
    </Link>
  );
}
