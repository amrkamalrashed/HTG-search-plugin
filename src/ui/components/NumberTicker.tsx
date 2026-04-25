import { h } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import styles from '../styles.css';

interface Props {
  value: number;
  /** Animation duration in ms. Defaults to 320. */
  duration?: number;
  /** Number formatter; defaults to integer rounding. */
  format?: (n: number) => string;
}

/**
 * Smoothly tweens between two integers. Used in result-count and
 * "{n} selected" labels so they don't snap. Uses requestAnimationFrame
 * with an ease-out curve.
 */
export function NumberTicker({ value, duration = 320, format }: Props) {
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (display === value) return;
    fromRef.current = display;
    startRef.current = null;
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);

    const step = (ts: number) => {
      if (startRef.current === null) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const t = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const current = fromRef.current + (value - fromRef.current) * eased;
      setDisplay(t === 1 ? value : Math.round(current));
      if (t < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [value, duration]);

  const text = format ? format(display) : String(display);
  return <span class={styles.ticker}>{text}</span>;
}
