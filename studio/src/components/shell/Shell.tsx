"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  AudioLines, Clapperboard, Download, FolderOpen, Home, Image as ImageIcon, LayoutTemplate, LogOut, Menu, Palette, Settings, Shapes, Shield, Sparkles, Wand2, Film, Coins,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { api } from "@/lib/api";
import { Logo } from "./Logo";

export interface ShellUser { id: string; email: string; name: string | null; role: string; plan: string; credits: number; avatarUrl: string | null }

const NAV = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/ai-studio", label: "AI Studio", icon: Sparkles },
  { href: "/editor", label: "Video Editor", icon: Clapperboard },
  { href: "/motion", label: "Motion Graphics", icon: Shapes },
  { href: "/animation", label: "AI Animation", icon: Wand2 },
  { href: "/image", label: "Image Studio", icon: ImageIcon },
  { href: "/audio", label: "Audio Studio", icon: AudioLines },
  { href: "/templates", label: "Templates", icon: LayoutTemplate },
  { href: "/brand", label: "Brand Kit", icon: Palette },
  { href: "/projects", label: "My Projects", icon: FolderOpen },
  { href: "/assets", label: "Assets Library", icon: Film },
  { href: "/exports", label: "Export History", icon: Download },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Shell({ user, children }: { user: ShellUser; children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const nav = user.role === "ADMIN" ? [...NAV, { href: "/admin", label: "Admin", icon: Shield }] : NAV;

  async function logout() {
    await api("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="px-5 pb-4 pt-5">
        <Link href="/home" onClick={() => setOpen(false)}>
          <Logo />
        </Link>
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = path === href || (href !== "/home" && path.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition",
                active ? "bg-white/[0.07] text-white" : "text-ink-300 hover:bg-white/[0.04] hover:text-ink-100",
              )}
            >
              <Icon className={cn("h-4 w-4", active ? "text-accent-soft" : "text-ink-400 group-hover:text-ink-200")} />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="m-3 rounded-xl border border-white/[0.06] bg-ink-850/80 p-3">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-xs text-ink-300">
            <Coins className="h-3.5 w-3.5 text-glow-amber" /> Credits
          </span>
          <span className="text-sm font-semibold tabular-nums">{user.credits.toLocaleString()}</span>
        </div>
        <div className="mt-2 flex items-center gap-2.5 border-t border-white/[0.06] pt-2.5">
          <div className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-accent/20 text-xs font-bold text-accent-soft">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {user.avatarUrl ? <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" /> : (user.name ?? user.email)[0]?.toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-xs font-medium">{user.name ?? user.email}</div>
            <div className="text-[10px] uppercase tracking-wider text-ink-400">{user.plan} plan</div>
          </div>
          <button onClick={logout} title="Sign out" className="rounded-md p-1.5 text-ink-400 hover:bg-white/5 hover:text-white">
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 border-r border-white/[0.05] bg-ink-950/70 backdrop-blur lg:block">{sidebar}</aside>
      {open ? (
        <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/60" />
          <aside className="absolute left-0 top-0 h-full w-64 border-r border-white/[0.06] bg-ink-900" onClick={(e) => e.stopPropagation()}>
            {sidebar}
          </aside>
        </div>
      ) : null}
      <div className="min-w-0 flex-1">
        <div className="sticky top-0 z-30 flex items-center gap-3 border-b border-white/[0.05] bg-ink-950/80 px-4 py-3 backdrop-blur lg:hidden">
          <button onClick={() => setOpen(true)} aria-label="Open navigation" className="rounded-md p-1.5 hover:bg-white/5">
            <Menu className="h-5 w-5" />
          </button>
          <Logo />
        </div>
        {children}
      </div>
    </div>
  );
}
