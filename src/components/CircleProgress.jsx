import { useEffect, useRef } from 'react';

/**
 * CircleProgress — Animated SVG circular progress ring.
 *
 * Props:
 *   value     — number 0-100
 *   size      — diameter in px (default 80)
 *   stroke    — ring thickness (default 6)
 *   color     — stroke color (default auto from value)
 *   label     — center text override (default shows value)
 *   duration  — animation duration ms (default 1200)
 */
export default function CircleProgress({
  value = 0,
  size = 80,
  stroke = 6,
  color,
  label,
  duration = 1200,
}) {
  const circleRef = useRef(null);
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  // Color by score
  const autoColor = value >= 80 ? '#22c55e' : value >= 60 ? '#f59e0b' : '#ef4444';
  const ringColor = color || autoColor;

  useEffect(() => {
    if (!circleRef.current) return;
    const target = circumference - (value / 100) * circumference;

    // Start from full offset (empty ring)
    circleRef.current.style.transition = 'none';
    circleRef.current.style.strokeDashoffset = circumference;

    // Trigger animation on next frame
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (circleRef.current) {
          circleRef.current.style.transition = `stroke-dashoffset ${duration}ms cubic-bezier(0.34,1.1,0.64,1)`;
          circleRef.current.style.strokeDashoffset = target;
        }
      });
    });
  }, [value, circumference, duration]);

  return (
    <div className="circle-progress-root" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth={stroke}
        />
        {/* Animated foreground ring */}
        <circle
          ref={circleRef}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={ringColor}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          style={{
            transform: 'rotate(-90deg)',
            transformOrigin: 'center',
            filter: `drop-shadow(0 0 6px ${ringColor}88)`,
          }}
        />
      </svg>
      {/* Center label */}
      <div className="circle-progress-label" style={{ color: ringColor }}>
        {label ?? value}
      </div>
    </div>
  );
}
