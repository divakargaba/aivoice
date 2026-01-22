import { TopNav } from "@/components/layout/top-nav";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-[rgb(var(--bg-base))]">
            <TopNav />
            <main className="pt-16">
                {children}
            </main>
        </div>
    );
}
