import { useEffect, useRef, useState } from 'react';

/**
 * Animates a number from 0 → target using requestAnimationFrame.
 * @param {number} target - Final value to count to
 * @param {number} duration - Animation duration in ms (default 1400)
 * @param {boolean} trigger - Start animation when true (default true)
 */
export function useCountUp(target, duration = 1400, trigger = true) {
  const [value, setValue] = useState(0);
  const frameRef = useRef(null);
  const startRef = useRef(null);

  useEffect(() => {
    if (!trigger || target === 0) return;

    // Ease-out cubic
    const ease = (t) => 1 - Math.pow(1 - t, 3);

    const animate = (timestamp) => {
      if (!startRef.current) startRef.current = timestamp;
      const elapsed = timestamp - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      setValue(Math.round(ease(progress) * target));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      startRef.current = null;
    };
  }, [target, duration, trigger]);

  return value;
}
