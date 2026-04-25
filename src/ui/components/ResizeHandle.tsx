import { h } from 'preact';
import { useEffect, useRef } from 'preact/hooks';
import type { UiSize } from '@shared/messages';
import styles from '../styles.css';

interface Props {
  size: UiSize;
  min: UiSize;
  max: UiSize;
  onResize: (size: UiSize) => void;
  onCommit: (size: UiSize) => void;
}

/**
 * Drag handle in the bottom-right corner. While the user drags we send
 * RESIZE events on every move (so the iframe shrinks/grows live); on
 * mouseup we send a single SAVE_UI_SIZE so the new size sticks across
 * sessions.
 */
export function ResizeHandle({ size, min, max, onResize, onCommit }: Props) {
  const startRef = useRef<{ x: number; y: number; w: number; h: number } | null>(null);
  const latestRef = useRef<UiSize>(size);

  useEffect(() => {
    latestRef.current = size;
  }, [size]);

  const onMouseDown = (e: MouseEvent) => {
    e.preventDefault();
    startRef.current = { x: e.screenX, y: e.screenY, w: size.width, h: size.height };
    const onMove = (ev: MouseEvent) => {
      const start = startRef.current;
      if (!start) return;
      const dx = ev.screenX - start.x;
      const dy = ev.screenY - start.y;
      const next: UiSize = {
        width: clamp(start.w + dx, min.width, max.width),
        height: clamp(start.h + dy, min.height, max.height),
      };
      latestRef.current = next;
      onResize(next);
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      onCommit(latestRef.current);
      startRef.current = null;
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  return <div class={styles.resizeHandle} onMouseDown={onMouseDown} />;
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}
