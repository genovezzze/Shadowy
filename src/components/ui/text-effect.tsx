"use client";

import React, { memo } from "react";
import {
  AnimatePresence,
  motion,
  type TargetAndTransition,
  type Variants,
} from "framer-motion";
import { cn } from "@/lib/utils";

type Preset = "blur" | "shake" | "scale" | "fade" | "slide";

type TextEffectProps = {
  children: string;
  per?: "word" | "char" | "line";
  as?: keyof React.JSX.IntrinsicElements;
  variants?: { container?: Variants; item?: Variants };
  className?: string;
  preset?: Preset;
  delay?: number;
  trigger?: boolean;
  onAnimationComplete?: () => void;
  segmentWrapperClassName?: string;
};

const staggerTimes = { char: 0.03, word: 0.05, line: 0.1 };

const defaultContainer: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
  exit: { transition: { staggerChildren: 0.05, staggerDirection: -1 } },
};

const defaultItem: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const presets: Record<
  Preset,
  { container: Variants; item: Variants }
> = {
  blur: {
    container: defaultContainer,
    item: {
      hidden: { opacity: 0, filter: "blur(12px)" },
      visible: { opacity: 1, filter: "blur(0px)" },
      exit: { opacity: 0, filter: "blur(12px)" },
    },
  },
  shake: {
    container: defaultContainer,
    item: {
      hidden: { x: 0 },
      visible: { x: [-5, 5, -5, 5, 0], transition: { duration: 0.5 } },
      exit: { x: 0 },
    },
  },
  scale: {
    container: defaultContainer,
    item: {
      hidden: { opacity: 0, scale: 0 },
      visible: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0 },
    },
  },
  fade: { container: defaultContainer, item: defaultItem },
  slide: {
    container: defaultContainer,
    item: {
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: 20 },
    },
  },
};

const Segment = memo(function Segment({
  segment,
  variants,
  per,
  wrapperClassName,
}: {
  segment: string;
  variants: Variants;
  per: "line" | "word" | "char";
  wrapperClassName?: string;
}) {
  const content =
    per === "line" ? (
      <motion.span variants={variants} className="block">
        {segment}
      </motion.span>
    ) : per === "word" ? (
      <motion.span
        aria-hidden="true"
        variants={variants}
        className="inline-block whitespace-pre"
      >
        {segment}
      </motion.span>
    ) : (
      <motion.span className="inline-block whitespace-pre">
        {segment.split("").map((char, index) => (
          <motion.span
            key={`${char}-${index}`}
            aria-hidden="true"
            variants={variants}
            className="inline-block whitespace-pre"
          >
            {char}
          </motion.span>
        ))}
      </motion.span>
    );

  return wrapperClassName ? (
    <span
      className={cn(
        per === "line" ? "block" : "inline-block",
        wrapperClassName,
      )}
    >
      {content}
    </span>
  ) : (
    content
  );
});

export function TextEffect({
  children,
  per = "word",
  as = "p",
  variants,
  className,
  preset,
  delay = 0,
  trigger = true,
  onAnimationComplete,
  segmentWrapperClassName,
}: TextEffectProps) {
  const segments =
    per === "line"
      ? children.split("\n")
      : per === "word"
        ? children.split(/(\s+)/)
        : children.split("");
  const MotionTag = motion[
    as as keyof typeof motion
  ] as typeof motion.div;
  const selected = preset
    ? presets[preset]
    : { container: defaultContainer, item: defaultItem };
  const container = variants?.container ?? selected.container;
  const item = variants?.item ?? selected.item;

  const delayedContainer: Variants = {
    hidden: container.hidden,
    visible: {
      ...container.visible,
      transition: {
        ...(container.visible as TargetAndTransition)?.transition,
        staggerChildren:
          (container.visible as TargetAndTransition)?.transition
            ?.staggerChildren ?? staggerTimes[per],
        delayChildren: delay,
      },
    },
    exit: container.exit,
  };

  return (
    <AnimatePresence mode="popLayout">
      {trigger && (
        <MotionTag
          initial="hidden"
          animate="visible"
          exit="exit"
          aria-label={per === "line" ? undefined : children}
          variants={delayedContainer}
          className={cn("whitespace-pre-wrap", className)}
          onAnimationComplete={onAnimationComplete}
        >
          {segments.map((segment, index) => (
            <Segment
              key={`${per}-${index}-${segment}`}
              segment={segment}
              variants={item}
              per={per}
              wrapperClassName={segmentWrapperClassName}
            />
          ))}
        </MotionTag>
      )}
    </AnimatePresence>
  );
}
