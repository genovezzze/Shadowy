"use client";

import * as React from "react";

/**
 * Scales its content down until it fits the width it is given.
 *
 * The matrix is a dashboard widget: its columns have real minimum widths and it
 * expects to be scrolled sideways. On a marketing page there is nothing to
 * scroll - the reader should see the whole table at once - so instead of
 * rewriting the widget for a second layout, the block is shrunk to whatever
 * factor makes its natural width fit, and the wrapper's height is pulled in by
 * the same factor so no empty strip is left under it.
 */
export function FitToWidth({
  children,
  minScale = 0.45,
}: {
  children: React.ReactNode;
  /** Below this the type would stop being readable; the block scrolls instead. */
  minScale?: number;
}) {
  const outerRef = React.useRef<HTMLDivElement | null>(null);
  const innerRef = React.useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = React.useState(1);
  const [height, setHeight] = React.useState<number | undefined>(undefined);

  React.useEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;

    const measure = () => {
      const available = outer.clientWidth;
      // scrollWidth is the content's own width, unaffected by the transform.
      const natural = inner.scrollWidth;
      if (!available || !natural) return;

      const next = Math.min(1, Math.max(minScale, available / natural));
      setScale(next);
      setHeight(inner.offsetHeight * next);
    };

    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(outer);
    observer.observe(inner);
    return () => observer.disconnect();
  }, [minScale]);

  return (
    <div ref={outerRef} className="w-full overflow-x-auto" style={{ height }}>
      <div
        ref={innerRef}
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          // Under the floor the content keeps its own width and the wrapper
          // scrolls; at or above it the width is the container's, so the
          // scaled block lands flush with both edges.
          width: scale > minScale ? `${100 / scale}%` : "max-content",
        }}
      >
        {children}
      </div>
    </div>
  );
}
