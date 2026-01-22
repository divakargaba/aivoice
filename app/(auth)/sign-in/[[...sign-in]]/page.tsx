import { SignIn } from "@clerk/nextjs";
import { TopNav } from "@/components/layout/top-nav";
import { motion } from "framer-motion";
import { Mic2 } from "lucide-react";
import { pageTransition, pageTransitionConfig } from "@/lib/motion";

export default function SignInPage() {
    return (
        <motion.div
            initial={pageTransition.initial}
            animate={pageTransition.animate}
            transition={pageTransitionConfig}
            className="min-h-screen bg-[rgb(var(--bg-base))]"
        >
            <TopNav />
            <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-6 py-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="w-full max-w-md space-y-8"
                >
                    {/* Header */}
                    <div className="text-center space-y-4">
                        <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-[rgb(var(--bg-elevated))] mb-4">
                            <Mic2 className="h-8 w-8 text-[rgb(var(--accent))]" />
                        </div>
                        <h1 className="text-headline text-[rgb(var(--text-primary))]">Welcome back</h1>
                        <p className="text-body-large text-[rgb(var(--text-secondary))]">
                            Sign in to continue creating your audiobooks
                        </p>
                    </div>

                    {/* Clerk Sign In */}
                    <div className="rounded-lg border border-[rgb(var(--border-base))] bg-[rgb(var(--bg-surface))] p-8">
                        <SignIn
                            appearance={{
                                elements: {
                                    rootBox: "w-full",
                                    card: "bg-transparent shadow-none border-0 p-0",
                                    headerTitle: "hidden",
                                    headerSubtitle: "hidden",
                                    socialButtonsBlockButton: "bg-[rgb(var(--bg-elevated))] hover:bg-[rgb(var(--bg-surface))] border-[rgb(var(--border-base))] text-[rgb(var(--text-primary))]",
                                    formButtonPrimary: "bg-[rgb(var(--accent))] hover:bg-[rgb(var(--accent-hover))] text-white",
                                    formFieldInput: "bg-[rgb(var(--bg-elevated))] border-[rgb(var(--border-base))] text-[rgb(var(--text-primary))]",
                                    formFieldLabel: "text-[rgb(var(--text-primary))]",
                                    footerActionLink: "text-[rgb(var(--accent))] hover:text-[rgb(var(--accent-hover))]",
                                    identityPreviewText: "text-[rgb(var(--text-primary))]",
                                    identityPreviewEditButton: "text-[rgb(var(--accent))] hover:text-[rgb(var(--accent-hover))]",
                                },
                            }}
                        />
                    </div>

                    {/* Help Text */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                        className="text-center space-y-2"
                    >
                        <p className="text-sm text-[rgb(var(--text-secondary))]">
                            Don't have an account?{" "}
                            <a href="/sign-up" className="text-[rgb(var(--accent))] hover:text-[rgb(var(--accent-hover))] transition-colors font-medium">
                                Sign up
                            </a>
                        </p>
                    </motion.div>
                </motion.div>
            </div>
        </motion.div>
    );
}
