/**
 * useScrollReveal — A custom hook for triggering CSS animations
 * when elements scroll into the viewport using IntersectionObserver.
 *
 * @param {Object} options
 * @param {number} [options.threshold=0.15] - Visibility threshold (0-1) to trigger animation
 * @param {string} [options.rootMargin='0px'] - Observer root margin
 * @param {boolean} [options.triggerOnce=true] - Whether to animate only once
 * @returns {React.RefObject} ref — Attach this to the element you want to animate
 *
 * @example
 * // In your component:
 * const ref = useScrollReveal();
 * return <div ref={ref} className="reveal fade-up">Content</div>;
 *
 * // CSS classes added: .reveal.active triggers the animation
 */
import { useEffect, useRef } from 'react';

const useScrollReveal = ({
  threshold = 0.15,
  rootMargin = '0px 0px -40px 0px',
  triggerOnce = true,
  dependency = null,
} = {}) => {
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          element.classList.add('active');
          if (triggerOnce) observer.unobserve(element);
        } else if (!triggerOnce) {
          element.classList.remove('active');
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [threshold, rootMargin, triggerOnce, dependency]);

  return ref;
};

/**
 * useStaggerReveal — Reveals multiple children with staggered delays.
 * Attach the returned ref to a parent container. Children should have
 * the `.reveal-child` class.
 *
 * @param {Object} options
 * @param {number} [options.staggerMs=100] - Delay between each child animation (ms)
 * @param {number} [options.threshold=0.1] - Visibility threshold to trigger
 * @returns {React.RefObject} ref — Attach to the parent container
 */
export const useStaggerReveal = ({
  staggerMs = 100,
  threshold = 0.1,
  dependency = null, // pass state here to trigger re-bind
} = {}) => {
  const ref = useRef(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const children = container.querySelectorAll('.reveal-child');
          children.forEach((child, index) => {
            child.style.transitionDelay = `${index * staggerMs}ms`;
            child.classList.add('active');
          });
          observer.unobserve(container);
        }
      },
      { threshold }
    );

    observer.observe(container);

    return () => observer.disconnect();
  }, [staggerMs, threshold, dependency]);

  return ref;
};

export default useScrollReveal;
