'use client';

import { useEffect, useRef, useState } from 'react';

interface CountUpProps {
  target: number;
  duration?: number; // ms
  className?: string;
  prefix?: string;
}

export default function CountUp({
  target,
  duration = 800,
  className = '',
  prefix = '',
}: CountUpProps) {
  const [displayed, setDisplayed] = useState(0);
  const frameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const prevTargetRef = useRef<number>(0);

  useEffect(() => {
    if (target === prevTargetRef.current) return;
    const startValue = prevTargetRef.current;
    prevTargetRef.current = target;

    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    startTimeRef.current = null;

    const step = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startValue + (target - startValue) * eased);
      setDisplayed(current);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(step);
      }
    };

    frameRef.current = requestAnimationFrame(step);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [target, duration]);

  return (
    <span className={className}>
      {prefix}{displayed.toLocaleString()}
    </span>
  );
}
