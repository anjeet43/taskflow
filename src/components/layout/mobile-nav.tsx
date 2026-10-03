"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Inbox, CalendarDays, Plus, CalendarRange, FolderKanban } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkspace } from "@/components/workspace-context";

const TABS = [
  { href: "/today", label: "Today", icon: CalendarDays },
  { href: "/inbox", label: "Inbox", icon: Inbox },
  { href: "/upcoming", label: "Upcoming", icon: CalendarRange },
  { href: "/projects", label: "Projects", icon: FolderKanban },
];

export function MobileNav() {
  const pathname = usePathname();
  const { setQuickAddOpen } = useWorkspace();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-around border-t border-border bg-surface/95 px-2 pb-[env(safe-area-inset-bottom,0px)] backdrop-blur md:hidden">
      {TABS.slice(0, 2).map(({ href, label, icon: Icon }) => (
        <Tab key={href} href={href} label={label} Icon={Icon} active={pathname === href} />
      ))}
      <button
        onClick={() => setQuickAddOpen(true)}
        className="-mt-5 flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-ink shadow-lg active:scale-95 transition-transform"
        aria-label="Add task"
      >
        <Plus className="h-6 w-6" />
      </button>
      {TABS.slice(2).map(({ href, label, icon: Icon }) => (
        <Tab key={href} href={href} label={label} Icon={Icon} active={pathname === href} />
      ))}
    </nav>
  );
}

function Tab({ href, label, Icon, active }: { href: string; label: string; Icon: typeof Inbox; active: boolean }) {
  return (
    <Link href={href} className={cn("flex flex-col items-center gap-0.5 px-3 py-2 text-[11px]", active ? "text-accent" : "text-muted")}>
      <Icon className="h-5 w-5" />
      {label}
    </Link>
  );
}
