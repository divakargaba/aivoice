"use client";

import { UserButton } from "@clerk/nextjs";
import { User, Bell, Shield, CreditCard } from "lucide-react";
import { motion } from "framer-motion";
import { pageTransition, pageTransitionConfig } from "@/lib/motion";

export default function SettingsPage() {
  return (
    <motion.div
      initial={pageTransition.initial}
      animate={pageTransition.animate}
      transition={pageTransitionConfig}
      className="min-h-[calc(100vh-4rem)]"
    >
      <div className="mx-auto max-w-3xl px-6 py-6">
        <div className="mb-6">
          <h1 className="text-headline mb-1">Settings</h1>
          <p className="text-sm text-[rgb(var(--text-secondary))]">
            Manage your account and preferences
          </p>
        </div>

        <div className="space-y-6">
          {/* Account */}
          <div className="border border-[rgb(var(--border-base))] bg-[rgb(var(--bg-surface))]">
            <div className="border-b border-[rgb(var(--border-base))] px-4 py-3">
              <h2 className="text-base font-semibold text-[rgb(var(--text-primary))]">Account</h2>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded bg-[rgb(var(--bg-elevated))] flex items-center justify-center">
                    <User className="h-5 w-5 text-[rgb(var(--text-secondary))]" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-[rgb(var(--text-primary))]">Profile</div>
                    <div className="text-xs text-[rgb(var(--text-secondary))]">Account information</div>
                  </div>
                </div>
                <UserButton afterSignOutUrl="/sign-in" />
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="border border-[rgb(var(--border-base))] bg-[rgb(var(--bg-surface))]">
            <div className="border-b border-[rgb(var(--border-base))] px-4 py-3">
              <h2 className="text-base font-semibold text-[rgb(var(--text-primary))]">Preferences</h2>
            </div>
            <div className="divide-y divide-[rgb(var(--border-base))]">
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded bg-[rgb(var(--bg-elevated))] flex items-center justify-center">
                    <Bell className="h-5 w-5 text-[rgb(var(--text-secondary))]" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-[rgb(var(--text-primary))]">Notifications</div>
                    <div className="text-xs text-[rgb(var(--text-secondary))]">Email and in-app notifications</div>
                  </div>
                </div>
              </div>
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded bg-[rgb(var(--bg-elevated))] flex items-center justify-center">
                    <Shield className="h-5 w-5 text-[rgb(var(--text-secondary))]" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-[rgb(var(--text-primary))]">Privacy</div>
                    <div className="text-xs text-[rgb(var(--text-secondary))]">Data and privacy settings</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Billing */}
          <div className="border border-[rgb(var(--border-base))] bg-[rgb(var(--bg-surface))]">
            <div className="border-b border-[rgb(var(--border-base))] px-4 py-3">
              <h2 className="text-base font-semibold text-[rgb(var(--text-primary))]">Billing</h2>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded bg-[rgb(var(--bg-elevated))] flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-[rgb(var(--text-secondary))]" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-[rgb(var(--text-primary))]">Subscription</div>
                    <div className="text-xs text-[rgb(var(--text-secondary))]">Manage your subscription</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
