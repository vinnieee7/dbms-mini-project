'use client';

import { useEffect, useState } from 'react';

export default function CountUp({
  to,
  from = 0,
  duration = 1.2,
  separator = ',',
  decimals = 0,
  suffix = '',
  prefix = '',
  className = '',
}) {
  const [count, setCount] = useState(from);

  useEffect(() => {
    let startTime;
    let animationFrame;

    const target = typeof to === 'number' ? to : parseFloat(to) || 0;
    const startVal = typeof from === 'number' ? from : parseFloat(from) || 0;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      // easeOutExpo
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = startVal + (target - startVal) * ease;

      setCount(current);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(target);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [to, from, duration]);

  const formatted =
    prefix +
    count.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }) +
    suffix;

  return <span className={className}>{formatted}</span>;
}

