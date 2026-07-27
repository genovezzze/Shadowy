"use client";

import * as React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export type ValueCard = {
  /** Path to a 3D icon in /public/images/icons-3d. Decorative - the title
   *  carries the meaning, so it renders with an empty alt. */
  icon: string;
  title: string;
  text: string;
};

function FeatureCard({
  icon,
  title,
  text,
  index,
  total,
}: ValueCard & { index: number; total: number }) {
  const isTopRow = index < 2;

  return (
    <div
      className={cn(
        "group/card relative flex flex-col py-5 px-5 sm:py-8 sm:px-7 border-white/[0.08]",
        // Mobile (1 col): bottom border between items
        index < total - 1 && "border-b",
        // SM+ override: remove bottom border from bottom row
        index >= 2 && "sm:border-b-0",
        // SM+ top row gets bottom border
        isTopRow && "sm:border-b",
        // SM+ right border except last
        index < total - 1 && "sm:border-r",
        // SM+ left border for left column
        index % 2 === 0 && "sm:border-l",
      )}
    >
      {/* hover gradient */}
      <div
        className={cn(
          "pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover/card:opacity-100",
          isTopRow
            ? "bg-gradient-to-t from-white/[0.04] to-transparent"
            : "bg-gradient-to-b from-white/[0.04] to-transparent",
        )}
      />

      {/* icon */}
      <div className="relative mb-3 sm:mb-4">
        <Image
          src={icon}
          alt=""
          width={96}
          height={96}
          className="size-7 shrink-0 transition-transform duration-200 group-hover/card:scale-105 sm:size-8"
        />
      </div>

      {/* title with animated left bar */}
      <div className="relative mb-2.5">
        <div className="absolute -left-5 sm:-left-7 inset-y-0 w-[3px] rounded-r-full bg-white/10 transition-all duration-200 h-5 group-hover/card:h-7 group-hover/card:bg-white/40" />
        <h3 className="relative font-accent text-sm font-bold leading-snug tracking-[0.015em] text-white transition-transform duration-200 group-hover/card:translate-x-1 [font-synthesis:weight] sm:text-base lg:text-lg">
          {title}
        </h3>
      </div>

      {/* text */}
      <p className="relative font-accent text-sm font-light leading-relaxed text-white/50">
        {text}
      </p>
    </div>
  );
}

/**
 * The 2x2 card grid shared by the employee and company value sections, so the
 * two blocks stay identical by construction rather than by copy-paste.
 */
export function ValueCardGrid({ cards }: { cards: readonly ValueCard[] }) {
  return (
    <motion.div
      className="min-w-0 grid grid-cols-1 rounded-2xl border border-white/[0.08] overflow-hidden sm:grid-cols-2"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.12 }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.09 } },
      }}
    >
      {cards.map((card, index) => (
        <motion.div
          key={card.title}
          variants={{
            hidden: { opacity: 0, y: 16 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
            },
          }}
        >
          <FeatureCard {...card} index={index} total={cards.length} />
        </motion.div>
      ))}
    </motion.div>
  );
}
