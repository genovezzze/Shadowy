"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * The small label above every section heading. Two tones only, because the page
 * alternates between white and near-black sections and nothing else sits
 * between them.
 */
export function SectionBadge({
  children,
  tone = "light",
  className,
}: {
  children: React.ReactNode;
  tone?: "light" | "dark";
  className?: string;
}) {
  return (
    <span
      className={cn(
        // A quiet eyebrow above the heading (atoms.technology style), not a pill.
        "inline-flex items-center text-xs font-semibold tracking-wide",
        tone === "light" ? "text-black/50" : "text-white/50",
        className,
      )}
    >
      {children}
    </span>
  );
}

/**
 * Enter-on-scroll wrapper used by every section.
 *
 * `once` keeps the animation from replaying when the visitor scrolls back up,
 * and the negative margin delays the trigger until the block is properly in
 * view rather than firing off a single pixel at the bottom edge.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  as = "div",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "header" | "li" | "article";
}) {
  const Component = motion[as];

  return (
    <Component
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, delay }}
      className={className}
    >
      {children}
    </Component>
  );
}
