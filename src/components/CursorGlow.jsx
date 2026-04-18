import { useEffect, useRef } from 'react';

/**
 * CursorGlow — renders a soft glowing orb that follows the cursor
 * with a spring-based lag effect. Zero dependencies.
 * Mount once at the app root.
 */
export default function CursorGlow() {
  const outerRef = useRef(null);
  const innerRef = useRef(null);
  const posRef = useRef({ x: -200, y: -200 });
  const smoothRef = useRef({ x: -200, y: -200 });
  const frameRef = useRef(null);

  useEffect(() => {
    const onMove = (e) => {
      posRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', onMove, { passive: true });

    const lerp = (a, b, t) => a + (b - a) * t;

    const loop = () => {
      // Inner dot — snaps quickly
      if (innerRef.current) {
        innerRef.current.style.transform = `translate(${posRef.current.x - 6}px, ${posRef.current.y - 6}px)`;
      }

      // Outer glow — lags with spring
      smoothRef.current.x = lerp(smoothRef.current.x, posRef.current.x, 0.1);
      smoothRef.current.y = lerp(smoothRef.current.y, posRef.current.y, 0.1);

      if (outerRef.current) {
        outerRef.current.style.transform = `translate(${smoothRef.current.x - 200}px, ${smoothRef.current.y - 200}px)`;
      }

      frameRef.current = requestAnimationFrame(loop);
    };

    frameRef.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('mousemove', onMove);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  return (
    <>
      {/* Large soft glow orb (lags behind) */}
      <div
        ref={outerRef}
        className="cursor-glow-outer"
        aria-hidden="true"
      />
      {/* Small sharp dot (snaps to cursor) */}
      <div
        ref={innerRef}
        className="cursor-glow-inner"
        aria-hidden="true"
      />
    </>
  );
}
