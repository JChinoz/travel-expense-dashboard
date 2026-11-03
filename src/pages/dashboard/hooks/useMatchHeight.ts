import { useEffect, type RefObject } from "react";

/** Keeps `target` exactly as tall as `source` on wide screens; clears the height on narrow ones. */
export function useMatchHeight(
  source: RefObject<HTMLElement | null>,
  target: RefObject<HTMLElement | null>,
  narrowQuery = "(max-width: 1000px)",
) {
  useEffect(() => {
    const src = source.current;
    const tgt = target.current;
    if (!src || !tgt) return;

    const sync = () => {
      if (window.matchMedia(narrowQuery).matches) {
        tgt.style.height = "";
        tgt.style.maxHeight = "";
        return;
      }
      const height = Math.ceil(src.getBoundingClientRect().height);
      if (!height) return;
      tgt.style.height = `${height}px`;
      tgt.style.maxHeight = `${height}px`;
    };

    const observer = new ResizeObserver(sync);
    observer.observe(src);
    window.addEventListener("resize", sync, { passive: true });
    sync();
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", sync);
      tgt.style.height = "";
      tgt.style.maxHeight = "";
    };
  }, [source, target, narrowQuery]);
}
