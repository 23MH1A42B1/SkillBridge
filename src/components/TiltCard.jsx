import { useRef } from 'react';

/**
 * TiltCard — wraps children with a 3D perspective tilt that follows
 * mouse position. Pure CSS + JS, zero dependencies.
 *
 * Props:
 *   className  — forwarded to wrapper div
 *   intensity  — tilt strength 1-20, default 10
 *   glare      — show a light-reflection glare (default true)
 *   scale      — scale on hover, default 1.02
 */
export default function TiltCard({
  children,
  className = '',
  intensity = 10,
  glare = true,
  scale = 1.02,
  style = {},
}) {
  const cardRef = useRef(null);
  const glareRef = useRef(null);
  const frameRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    if (frameRef.current) cancelAnimationFrame(frameRef.current);

    frameRef.current = requestAnimationFrame(() => {
      const rect = cardRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;   // -0.5 → 0.5
      const y = (e.clientY - rect.top) / rect.height - 0.5;    // -0.5 → 0.5

      cardRef.current.style.transform = [
        `perspective(900px)`,
        `rotateX(${-y * intensity * 2}deg)`,
        `rotateY(${x * intensity * 2}deg)`,
        `scale3d(${scale}, ${scale}, ${scale})`,
      ].join(' ');

      if (glare && glareRef.current) {
        const glareX = (x + 0.5) * 100;
        const glareY = (y + 0.5) * 100;
        glareRef.current.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.12) 0%, transparent 60%)`;
        glareRef.current.style.opacity = '1';
      }
    });
  };

  const handleMouseLeave = () => {
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    if (!cardRef.current) return;
    cardRef.current.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)';
    if (glare && glareRef.current) {
      glareRef.current.style.opacity = '0';
    }
  };

  return (
    <div
      ref={cardRef}
      className={`tilt-card ${className}`}
      style={style}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {glare && (
        <div
          ref={glareRef}
          className="tilt-glare"
          aria-hidden="true"
        />
      )}
      {children}
    </div>
  );
}
