import { useAppSelector } from '../../hooks/redux';

export function ScrollProgress() {
  const progress = useAppSelector((s) => s.ui.scrollProgress);
  return (
    <div
      aria-hidden="true"
      className="fixed left-0 top-0 z-[100] h-[2px] w-full bg-transparent"
    >
      <div
        className="h-full origin-left bg-gradient-to-r from-primary to-accent transition-transform duration-100"
        style={{ transform: `scaleX(${progress})` }}
      />
    </div>
  );
}
