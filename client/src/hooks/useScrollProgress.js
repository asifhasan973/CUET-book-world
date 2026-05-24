/**
 * useScrollProgress — Tracks scroll position relative to an element
 * and returns a normalized 0→1 progress value.
 *
 * Used to power scroll-driven animations like the 3D book rotation.
 *
 * @param {Object} options
 * @param {number} [options.offset=0] - Offset from viewport center (px)
 * @returns {{ ref: React.RefObject, progress: number }}
 *
 * @example
 * const { ref, progress } = useScrollProgress();
 * // progress=0 when element enters viewport, progress=1 when it exits
 * return <div ref={ref} style={{ transform: `rotateY(${progress * 360}deg)` }} />;
 */
import { useState, useEffect, useRef, useCallback } from 'react';

const useScrollProgress = ({ offset = 0 } = {}) => {
  const ref = useRef(null);
  const [progress, setProgress] = useState(0);
  const ticking = useRef(false);
  const rafId = useRef(null);

  const updateProgress = useCallback(() => {
    const el = ref.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const elHeight = rect.height;

    // Element starts entering when its top reaches the bottom of viewport
    // Element finishes leaving when its bottom reaches the top of viewport
    const totalTravel = windowHeight + elHeight;
    const traveled = windowHeight - rect.top + offset;

    const raw = traveled / totalTravel;
    setProgress(Math.max(0, Math.min(1, raw)));
  }, [offset]);

  useEffect(() => {
    const scheduleUpdate = () => {
      if (!ticking.current) {
        ticking.current = true;
        rafId.current = requestAnimationFrame(() => {
          updateProgress();
          ticking.current = false;
        });
      }
    };

    const observedElement = ref.current;
    const resizeObserver = typeof ResizeObserver !== 'undefined' && observedElement
      ? new ResizeObserver(() => scheduleUpdate())
      : null;

    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate);
    window.addEventListener('orientationchange', scheduleUpdate);
    window.addEventListener('load', scheduleUpdate);
    if (resizeObserver) {
      resizeObserver.observe(observedElement);
    }

    // Initial calculation
    updateProgress();

    return () => {
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
      window.removeEventListener('orientationchange', scheduleUpdate);
      window.removeEventListener('load', scheduleUpdate);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, [updateProgress]);

  return { ref, progress };
};

export default useScrollProgress;
