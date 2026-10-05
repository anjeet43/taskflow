"use client";
import { useRouter } from "next/navigation";
import { CheckCircle2, Calendar, Settings, Command, LogOut } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useWorkspace } from "@/components/workspace-context";
import { useProfile } from "@/lib/use-profile";
import { createClient } from "@/lib/supabase/client";

/** Phone-only avatar button in the page header. Replaces the old "More" tab: it holds every page that
 *  isn't in the bottom bar, plus the command palette and sign out. */
export function UserMenu() {
  const router = useRouter();
  const { setPaletteOpen } = useWorkspace();
  const { name, email, initial } = useProfile();

  async function signOut() {
    await createClient().auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Account and more"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-semibold text-accent-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 md:hidden"
      >
        {initial}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-56">
        <DropdownMenuLabel className="max-w-64">
          <span className="block truncate text-sm font-medium text-ink">{name || "Account"}</span>
          {email && <span className="block truncate text-xs font-normal text-muted">{email}</span>}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => router.push("/completed")}><CheckCircle2 className="h-4 w-4" /> Completed</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => router.push("/calendar")}><Calendar className="h-4 w-4" /> Calendar</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => router.push("/settings")}><Settings className="h-4 w-4" /> Settings</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => setPaletteOpen(true)}><Command className="h-4 w-4" /> Command palette</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={signOut}><LogOut className="h-4 w-4" /> Sign out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
