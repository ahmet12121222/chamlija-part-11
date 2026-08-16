"use client";

import { useEffect, useRef } from "react";

// Blocks text selection/copy across the homepage only (scoped via the wrapping ref + CSS class).
export function NoCopyGuard({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    function preventDefault(event: Event) {
      event.preventDefault();
    }

    function preventCopyShortcut(event: KeyboardEvent) {
      const key = event.key.toLowerCase();
      if ((event.ctrlKey || event.metaKey) && (key === "c" || key === "x" || key === "a")) {
        event.preventDefault();
      }
    }

    node.addEventListener("contextmenu", preventDefault);
    node.addEventListener("copy", preventDefault);
    node.addEventListener("cut", preventDefault);
    node.addEventListener("selectstart", preventDefault);
    document.addEventListener("keydown", preventCopyShortcut);

    return () => {
      node.removeEventListener("contextmenu", preventDefault);
      node.removeEventListener("copy", preventDefault);
      node.removeEventListener("cut", preventDefault);
      node.removeEventListener("selectstart", preventDefault);
      document.removeEventListener("keydown", preventCopyShortcut);
    };
  }, []);

  return (
    <div ref={containerRef} className="homepage-no-copy flex min-h-full flex-col">
      {children}
    </div>
  );
}
