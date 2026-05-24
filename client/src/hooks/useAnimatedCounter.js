/**
 * useAnimatedCounter — Smoothly animates a number from 0 to `target`
 * when the element scrolls into the viewport.
 *
 * Uses easeOutExpo for a satisfying deceleration curve.
 *
 * @param {number} target - The final number to animate to
 * @param {number} [duration=2000] - Animation duration in milliseconds
 * @returns {{ count: number, ref: React.RefObject }}
 *
 * @example
 * const { count, ref } = useAnimatedCounter(2500);
 * return <span ref={ref}>{count.toLocaleString()}</span>;
 */
import { useState, useEffect, useRef, useCallback } from 'react';

/** Easing function: fast start, smooth deceleration */
const easeOutExpo = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

const useAnimatedCounter = (target, duration = 2000) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const hasAnimated = useRef(false);

  const animate = useCallback(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;

    let startTime = null;

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutExpo(progress);

      setCount(Math.floor(easedProgress * target));

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  }, [target, duration]);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          animate();
          observer.unobserve(element);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [animate]);

  return { count, ref };
};

export default useAnimatedCounter;
