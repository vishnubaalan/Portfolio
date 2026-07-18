import { useEffect, useRef } from 'react';

export function HeroBackground() {
  const spotRef = useRef(null);

  useEffect(() => {
    const move = (e) => {
      if (!spotRef.current) return;
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      spotRef.current.style.background = `radial-gradient(600px circle at ${x}% ${y}%, oklch(0.65 0.22 275 / 0.15), transparent 60%)`;
    };
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Aurora blobs */}
      <div className="absolute -left-32 top-1/4 h-[500px] w-[500px] rounded-full bg-primary/20 blur-[120px] animate-aurora" />
      <div
        className="absolute -right-32 top-1/2 h-[500px] w-[500px] rounded-full bg-accent/20 blur-[120px] animate-aurora"
        style={{ animationDelay: '-8s' }}
      />
      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage:
            'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)',
        }}
      />
      {/* Mouse spotlight */}
      <div ref={spotRef} className="absolute inset-0" />
    </div>
  );
}
