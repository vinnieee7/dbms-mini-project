'use client';

export default function ShinyText({
  text,
  disabled = false,
  speed = 4,
  className = '',
  color = '#a1a1aa',
  shineColor = '#ffffff',
}) {
  return (
    <span
      className={`shiny-text ${className}`}
      style={{
        color,
        backgroundImage: disabled
          ? 'none'
          : `linear-gradient(120deg, ${color} 0%, ${color} 40%, ${shineColor} 50%, ${color} 60%, ${color} 100%)`,
        backgroundSize: '200% 100%',
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        WebkitTextFillColor: disabled ? 'initial' : 'transparent',
        animation: disabled ? 'none' : `shine ${speed}s linear infinite`,
        display: 'inline-block',
      }}
    >
      {text}
      <style jsx>{`
        @keyframes shine {
          0% {
            background-position: 100% 0;
          }
          100% {
            background-position: -100% 0;
          }
        }
      `}</style>
    </span>
  );
}

