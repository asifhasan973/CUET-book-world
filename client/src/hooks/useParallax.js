/**
 * useParallax — Creates a mouse-tracking parallax effect on child elements.
 *
 * Smoothly translates elements relative to the mouse position using
 * requestAnimationFrame for optimal performance.
 *
 * @param {number} [intensity=20] - Max translation in pixels (higher = more movement)
 * @returns {{ ref: React.RefObject, style: Object }} — Attach ref to the container,
 *   spread style onto moving elements
 *
 * @example
 * const { ref, style } = useParallax(30);
 * return (
 *   <div ref={ref}>
 *     <div style={style}>I move with the mouse!</div>
 *   </div>
 * );
 */
import { useState, useEffect, useRef, useCallback } from 'react';

const useParallax = (intensity = 20) => {
  const ref = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const animationFrame = useRef(null);

  const handleMouseMove = useCallback((e) => {
    if (animationFrame.current) {
      cancelAnimationFrame(animationFrame.current);
    }

    animationFrame.current = requestAnimationFrame(() => {
      const container = ref.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = ((e.clientX - centerX) / rect.width) * intensity;
      const deltaY = ((e.clientY - centerY) / rect.height) * intensity;

      setPosition({ x: deltaX, y: deltaY });
    });
  }, [intensity]);

  const handleMouseLeave = useCallback(() => {
    setPosition({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, [handleMouseMove, handleMouseLeave]);

  const style = {
    transform: `translate(${position.x}px, ${position.y}px)`,
    transition: 'transform 0.3s ease-out',
  };

  return { ref, style };
};

export default useParallax;
