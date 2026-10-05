"use client";
import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Inbox, CalendarDays, CalendarRange, CheckCircle2, Calendar, FolderKanban, Settings, Plus, Moon, SunMedium, Search as SearchIcon,
} from "lucide-react";
import { useWorkspace } from "@/components/workspace-context";

export function CommandPalette() {
  const { paletteOpen, setPaletteOpen, setQuickAddOpen, setSearchOpen } = useWorkspace();
  const router = useRouter();
  const { setTheme, theme } = useTheme();

  const go = (href: string) => {
    router.push(href);
    setPaletteOpen(false);
  };

  return (
    <Command.Dialog
      open={paletteOpen}
      onOpenChange={setPaletteOpen}
      label="Command palette"
      className="fixed left-1/2 top-[18%] z-50 w-[92vw] max-w-lg -translate-x-1/2 overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl animate-slide-up max-md:left-3 max-md:right-3 max-md:top-[calc(env(safe-area-inset-top)+0.75rem)] max-md:w-auto max-md:max-w-none max-md:translate-x-0"
    >
      <div className="flex items-center gap-2 border-b border-border px-3">
        <SearchIcon className="h-4 w-4 text-muted" />
        <Command.Input placeholder="Type a command or search..." className="h-12 w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted" />
      </div>
      <Command.List className="max-h-80 overflow-y-auto overscroll-contain p-2 max-md:max-h-[42dvh]">
        <Command.Empty className="py-6 text-center text-sm text-muted">No results found.</Command.Empty>
        <Command.Group heading="Actions" className="px-2 py-1 text-xs font-medium text-muted [&_[cmdk-group-heading]]:px-1">
          <Item onSelect={() => { setPaletteOpen(false); setQuickAddOpen(true); }} icon={Plus}>Create task</Item>
          <Item onSelect={() => { setPaletteOpen(false); setSearchOpen(true); }} icon={SearchIcon}>Search tasks</Item>
          <Item onSelect={() => setTheme(theme === "dark" ? "light" : "dark")} icon={theme === "dark" ? SunMedium : Moon}>
            Toggle dark mode
          </Item>
        </Command.Group>
        <Command.Group heading="Go to" className="px-2 py-1 text-xs font-medium text-muted [&_[cmdk-group-heading]]:px-1">
          <Item onSelect={() => go("/today")} icon={CalendarDays}>Today</Item>
          <Item onSelect={() => go("/inbox")} icon={Inbox}>Inbox</Item>
          <Item onSelect={() => go("/upcoming")} icon={CalendarRange}>Upcoming</Item>
          <Item onSelect={() => go("/completed")} icon={CheckCircle2}>Completed</Item>
          <Item onSelect={() => go("/calendar")} icon={Calendar}>Calendar</Item>
          <Item onSelect={() => go("/projects")} icon={FolderKanban}>Projects</Item>
          <Item onSelect={() => go("/settings")} icon={Settings}>Settings</Item>
        </Command.Group>
      </Command.List>
    </Command.Dialog>
  );
}

function Item({ children, onSelect, icon: Icon }: { children: React.ReactNode; onSelect: () => void; icon: typeof Plus }) {
  return (
    <Command.Item
      onSelect={onSelect}
      className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-ink aria-selected:bg-surface-2 max-md:min-h-11"
    >
      <Icon className="h-4 w-4 text-muted" />
      {children}
    </Command.Item>
  );
}
