import { UserButton } from "@clerk/nextjs";

export function Header() {
    return (
        <header className="flex h-16 items-center border-b bg-background px-6">
            <div className="flex flex-1 items-center justify-between">
                <div className="flex items-center gap-4">
                    <h2 className="text-lg font-semibold">Dashboard</h2>
                </div>
                <div className="flex items-center gap-4">
                    <UserButton afterSignOutUrl="/sign-in" />
                </div>
            </div>
        </header>
    );
}

