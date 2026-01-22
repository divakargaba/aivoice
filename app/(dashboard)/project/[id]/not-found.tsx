import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { pageTransition, pageTransitionConfig } from "@/lib/motion";

export default function ProjectNotFound() {
  return (
    <motion.div
      initial={pageTransition.initial}
      animate={pageTransition.animate}
      transition={pageTransitionConfig}
      className="flex items-center justify-center min-h-[calc(100vh-4rem)]"
    >
      <div className="rounded-lg border border-[rgb(var(--border-base))] bg-[rgb(var(--bg-surface))] p-16">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[rgb(var(--bg-elevated))]">
            <AlertCircle className="h-10 w-10 text-[rgb(var(--destructive))]" />
          </div>
          <h3 className="mt-6 text-xl font-semibold text-[rgb(var(--text-primary))]">
            Project Not Found
          </h3>
          <p className="mt-2 text-sm text-[rgb(var(--text-secondary))] max-w-sm">
            This project doesn't exist or you don't have access to it.
          </p>
          <Link href="/dashboard" className="mt-6">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
