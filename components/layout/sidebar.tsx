"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Mic2,
    HelpCircle,
    BookOpen,
    Sparkles
} from "lucide-react";

const workspaceNav = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
];

const createNav = [
    { name: "Voices", href: "/voices", icon: Mic2 },
];

const helpNav = [
    { name: "Help", href: "/help", icon: HelpCircle },
    { name: "Examples", href: "/examples", icon: BookOpen },
];

export function Sidebar() {
    const pathname = usePathname();

    const isActive = (href: string) => {
        return pathname === href || pathname?.startsWith(href + "/");
    };

    return (
        <div className="flex h-screen w-64 flex-col border-r border-border bg-card">
            {/* Logo */}
            <div className="flex h-16 items-center border-b border-border px-6">
                <Link href="/dashboard" className="flex items-center gap-3 group">
                    <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Mic2 className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-xl font-bold">AI Voice</span>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-6 p-4 overflow-y-auto scrollbar-premium">
                {/* Workspace */}
                <div className="space-y-1">
                    <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Workspace
                    </p>
                    {workspaceNav.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                                isActive(item.href)
                                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <item.icon className="h-5 w-5 shrink-0" />
                            {item.name}
                        </Link>
                    ))}
                </div>

                {/* Create */}
                <div className="space-y-1">
                    <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Create
                    </p>
                    {createNav.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                                isActive(item.href)
                                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <item.icon className="h-5 w-5 shrink-0" />
                            {item.name}
                        </Link>
                    ))}
                </div>

                {/* Help */}
                <div className="space-y-1">
                    <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Help
                    </p>
                    {helpNav.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                                isActive(item.href)
                                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <item.icon className="h-5 w-5 shrink-0" />
                            {item.name}
                        </Link>
                    ))}
                </div>
            </nav>

            {/* Footer */}
            <div className="border-t border-border p-4">
                <div className="card-premium p-3 space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Powered by</p>
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-3 w-3 text-primary" />
                        <p className="text-xs font-semibold">ElevenLabs & OpenAI</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
