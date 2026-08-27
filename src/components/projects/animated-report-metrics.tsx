"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

type Metric = {
  value: number;
  label: string;
  format: (value: number) => string;
  accent?: boolean;
};

const formatCurrency = (value: number, withPlus = false) =>
  `${withPlus ? "+" : ""}€${value.toFixed(2).replace(".", ",")}`;

const metrics: Metric[] = [
  {
    value: 810,
    label: "Kopējais laiks",
    format: (value) => {
      const minutes = Math.round(value);
      return `${Math.floor(minutes / 60)} h ${minutes % 60} min`;
    },
  },
  { value: 337.5, label: "Darba pašizmaksa", format: (value) => formatCurrency(value) },
  { value: 250, label: "Plānotais limits", format: (value) => formatCurrency(value) },
  { value: 87.5, label: "Virs limita", format: (value) => formatCurrency(value, true), accent: true },
];

function AnimatedValue({ metric, active }: { metric: Metric; active: boolean }) {
  const reduceMotion = useReducedMotion();
  const [current, setCurrent] = useState(reduceMotion ? metric.value : 0);

  useEffect(() => {
    if (!active) return;
    if (reduceMotion) {
      setCurrent(metric.value);
      return;
    }

    const duration = 1650;
    const start = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      setCurrent(metric.value * eased);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, metric.value, reduceMotion]);

  return <>{metric.format(current)}</>;
}

export function AnimatedReportMetrics() {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const isInView = useInView(ref, { once: true, amount: 0.45 });
  const active = Boolean(reduceMotion || isInView);

  return (
    <div ref={ref} className="grid grid-cols-2 gap-x-6 gap-y-10 py-3 md:gap-x-10 md:gap-y-14">
      {metrics.map((metric, index) => (
        <motion.div
          key={metric.label}
          initial={reduceMotion ? false : { opacity: 0, y: 22 }}
          animate={active ? { opacity: 1, y: 0, scale: 1 } : undefined}
          transition={{
            duration: reduceMotion ? 0 : 0.7,
            delay: reduceMotion ? 0 : index * 0.09,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="relative min-w-0"
        >
          <p
            className={`mb-3 whitespace-nowrap text-[clamp(2.15rem,3.1vw,3.75rem)] font-bold leading-[0.9] tracking-[-0.065em] ${
              metric.accent ? "text-[#d97706]" : "text-black"
            }`}
          >
            <AnimatedValue metric={metric} active={active} />
          </p>
          <p className={`m-0 text-sm font-bold md:text-[15px] ${metric.accent ? "text-[#a85b00]" : "text-black/50"}`}>
            {metric.label}
          </p>
        </motion.div>
      ))}
    </div>
  );
}
