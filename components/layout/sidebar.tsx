"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Folder,
    Plus,
    Mic2,
    Headphones,
    Download,
    BarChart3,
    BookOpen,
    HelpCircle,
    Sparkles,
} from "lucide-react";

const workspaceNav = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Projects", href: "/projects", icon: Folder },
];

const createNav = [
    { name: "Create", href: "/dashboard", icon: Plus, highlight: true },
];

const studioNav = [
    { name: "Voices", href: "/voices", icon: Mic2 },
];

const learnNav = [
    { name: "How it works", href: "/how-it-works", icon: Sparkles },
    { name: "Examples", href: "/examples", icon: BookOpen },
    { name: "Help", href: "/help", icon: HelpCircle },
];

export function Sidebar() {
    const pathname = usePathname();

    const isActive = (href: string) => {
        if (href === "/dashboard") {
            return pathname === "/dashboard";
        }
        return pathname === href || pathname?.startsWith(href + "/");
    };

    const NavSection = ({
        title,
        items,
    }: {
        title?: string;
        items: Array<{
            name: string;
            href: string;
            icon: any;
            highlight?: boolean;
        }>;
    }) => (
        <div className="space-y-1">
            {title && (
                <p className="px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                    {title}
                </p>
            )}
            {items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                    <Link
                        key={item.name}
                        href={item.href}
                        className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                            active
                                ? "bg-primary text-primary-foreground"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground",
                            item.highlight && !active && "text-foreground"
                        )}
                    >
                        <Icon className="h-4 w-4 shrink-0" />
                        {item.name}
                    </Link>
                );
            })}
        </div>
    );

    return (
        <div className="flex h-screen w-64 flex-col border-r border-border bg-card">
            {/* Logo */}
            <div className="flex h-16 items-center border-b border-border px-6">
                <Link href="/dashboard" className="flex items-center gap-2.5 group">
                    <div className="h-7 w-7 rounded-md bg-primary flex items-center justify-center">
                        <Headphones className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <span className="text-base font-semibold text-foreground">Audiobook Studio</span>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-6 p-4 overflow-y-auto scrollbar-custom">
                <NavSection title="Workspace" items={workspaceNav} />
                <NavSection items={createNav} />
                <NavSection title="Studio" items={studioNav} />
                <NavSection title="Learn" items={learnNav} />
            </nav>
        </div>
    );
}
