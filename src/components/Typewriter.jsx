import { useEffect, useState } from 'react';

/**
 * Typewriter — types through an array of strings in sequence,
 * with per-char typing speed, pause, and backspace.
 *
 * Props:
 *   words      — string[] of phrases to cycle through
 *   typingMs   — ms per character typed (default 65)
 *   deletingMs — ms per character deleted (default 35)
 *   pauseMs    — ms to pause after fully typing a word (default 1800)
 *   className  — extra classes on the span
 *   cursor     — show blinking cursor (default true)
 */
export default function Typewriter({
  words = [],
  typingMs = 65,
  deletingMs = 35,
  pauseMs = 1800,
  className = '',
  cursor = true,
}) {
  const [displayed, setDisplayed] = useState('');
  const [wordIdx, setWordIdx] = useState(0);
  const [phase, setPhase] = useState('typing'); // 'typing' | 'pausing' | 'deleting'

  useEffect(() => {
    if (!words.length) return;
    const word = words[wordIdx % words.length];

    if (phase === 'typing') {
      if (displayed.length < word.length) {
        const t = setTimeout(() => setDisplayed(word.slice(0, displayed.length + 1)), typingMs);
        return () => clearTimeout(t);
      } else {
        // Fully typed → pause
        const t = setTimeout(() => setPhase('deleting'), pauseMs);
        return () => clearTimeout(t);
      }
    }

    if (phase === 'deleting') {
      if (displayed.length > 0) {
        const t = setTimeout(() => setDisplayed(displayed.slice(0, -1)), deletingMs);
        return () => clearTimeout(t);
      } else {
        // Fully deleted → next word
        setWordIdx((i) => (i + 1) % words.length);
        setPhase('typing');
      }
    }
  }, [displayed, phase, wordIdx, words, typingMs, deletingMs, pauseMs]);

  return (
    <span className={`typewriter-root ${className}`}>
      {displayed}
      {cursor && <span className="typewriter-cursor" aria-hidden="true">|</span>}
    </span>
  );
}
