"use client";

import { useEffect, type ReactNode } from "react";

/**
 * Turns on the new design for everything inside it: cards, buttons, fields,
 * badges and the page header restyle themselves through the `.ui-new` rules
 * in globals.css. The class also goes on <html> while mounted so dialogs and
 * menus, which portal out to <body>, pick it up too.
 */
export function NewDesignScope({ children }: { children: ReactNode }) {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("ui-new");
    return () => root.classList.remove("ui-new");
  }, []);

  return <div className="ui-new">{children}</div>;
}
