/* Framer Motion Variants
 * Subtle, slow, premium motion
 * No bounce, no cartoon easing
 */

import { Variants } from "framer-motion";

// Page transitions
export const pageTransition: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export const pageTransitionConfig = {
  duration: 0.2,
  ease: [0.4, 0, 0.2, 1], // Custom easing - smooth, not bouncy
};

// Panel transitions (slide + fade)
export const panelSlide: Variants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
};

export const panelSlideConfig = {
  duration: 0.2,
  ease: [0.4, 0, 0.2, 1],
};

// Fade in
export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const fadeInConfig = {
  duration: 0.15,
  ease: [0.4, 0, 0.2, 1],
};

// Hover lift (subtle)
export const hoverLift = {
  transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] },
  whileHover: { y: -2, transition: { duration: 0.2 } },
};

// Modal transition (scale + fade + backdrop blur)
export const modalTransition: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};

export const modalTransitionConfig = {
  duration: 0.2,
  ease: [0.4, 0, 0.2, 1],
};

// Content crossfade (for chapter switching)
export const contentCrossfade: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const contentCrossfadeConfig = {
  duration: 0.15,
  ease: [0.4, 0, 0.2, 1],
};

// Tab underline animation
export const tabUnderline = {
  transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] },
};

// Respect prefers-reduced-motion
export const shouldReduceMotion = () => {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

// Get motion config with reduced motion support
export const getMotionConfig = (config: { duration: number; ease: number[] }) => {
  if (shouldReduceMotion()) {
    return { duration: 0.01, ease: [0, 0, 1, 1] };
  }
  return config;
};
