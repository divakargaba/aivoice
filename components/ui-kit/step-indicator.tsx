"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type StepStatus = "complete" | "current" | "upcoming";

interface Step {
  id: string;
  label: string;
  description?: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

export function StepIndicator({
  steps,
  currentStep,
  className,
}: StepIndicatorProps) {
  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const status: StepStatus =
            index < currentStep
              ? "complete"
              : index === currentStep
              ? "current"
              : "upcoming";

          return (
            <div key={step.id} className="flex items-center flex-1">
              {/* Step Circle */}
              <div className="flex flex-col items-center flex-1">
                <div
                  className={cn(
                    "relative flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-200",
                    status === "complete" &&
                      "bg-primary border-primary text-primary-foreground",
                    status === "current" &&
                      "bg-primary border-primary text-primary-foreground",
                    status === "upcoming" &&
                      "bg-background border-border text-muted-foreground"
                  )}
                >
                  {status === "complete" ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span
                      className={cn(
                        "text-sm font-semibold"
                      )}
                    >
                      {index + 1}
                    </span>
                  )}
                </div>

                {/* Label */}
                <div className="mt-3 text-center max-w-[120px]">
                  <p
                    className={cn(
                      "text-sm font-medium transition-colors",
                      status === "current" && "text-foreground",
                      status === "complete" && "text-primary",
                      status === "upcoming" && "text-muted-foreground"
                    )}
                  >
                    {step.label}
                  </p>
                  {step.description && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {step.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Connector */}
              {index < steps.length - 1 && (
                <div className="flex-1 h-0.5 mx-2 mb-5">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-300",
                      index < currentStep
                        ? "bg-primary"
                        : "bg-border"
                    )}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
