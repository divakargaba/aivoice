"use client";

import { UserButton } from "@clerk/nextjs";

export function Header() {
    return (
        <header className="flex h-16 items-center justify-between border-b border-border bg-background px-6">
            <div className="flex items-center gap-4">
                {/* Breadcrumbs or page title can go here if needed */}
            </div>
            <div className="flex items-center gap-4">
                <UserButton afterSignOutUrl="/sign-in" />
            </div>
        </header>
    );
}
