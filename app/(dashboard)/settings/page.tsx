import { PageHeader } from "@/components/ui-kit/page-header";
import { BentoCard } from "@/components/ui-kit/bento-grid";
import { Button } from "@/components/ui/button";
import { UserButton } from "@clerk/nextjs";
import { User, Bell, Shield, CreditCard } from "lucide-react";

export default function SettingsPage() {
    return (
        <div className="space-y-8">
            <PageHeader
                title="Settings"
                subtitle="Manage your account and preferences"
            />

            <div className="space-y-6">
                {/* Account Settings */}
                <div className="space-y-4">
                    <div>
                        <h2 className="text-title text-foreground mb-1">Account</h2>
                        <p className="text-body text-muted-foreground">
                            Manage your account information
                        </p>
                    </div>
                    <BentoCard size="md">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <User className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-foreground">Profile</h3>
                                    <p className="text-xs text-muted-foreground">
                                        Update your account information
                                    </p>
                                </div>
                            </div>
                            <UserButton afterSignOutUrl="/sign-in" />
                        </div>
                    </BentoCard>
                </div>

                {/* Coming Soon Sections */}
                <div className="space-y-4">
                    <div>
                        <h2 className="text-title text-foreground mb-1">Preferences</h2>
                        <p className="text-body text-muted-foreground">
                            Customize your experience
                        </p>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                        <BentoCard size="md">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                                    <Bell className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-sm font-medium text-foreground">Notifications</h3>
                                    <p className="text-xs text-muted-foreground">
                                        Coming soon
                                    </p>
                                </div>
                            </div>
                        </BentoCard>

                        <BentoCard size="md">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                                    <Shield className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-sm font-medium text-foreground">Privacy</h3>
                                    <p className="text-xs text-muted-foreground">
                                        Coming soon
                                    </p>
                                </div>
                            </div>
                        </BentoCard>
                    </div>
                </div>

                {/* Billing (Placeholder) */}
                <div className="space-y-4">
                    <div>
                        <h2 className="text-title text-foreground mb-1">Billing</h2>
                        <p className="text-body text-muted-foreground">
                            Manage your subscription and billing
                        </p>
                    </div>
                    <BentoCard size="md">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                                <CreditCard className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-sm font-medium text-foreground">Subscription</h3>
                                <p className="text-xs text-muted-foreground">
                                    Coming soon
                                </p>
                            </div>
                        </div>
                    </BentoCard>
                </div>
            </div>
        </div>
    );
}
