import * as ToggleGroup from '@radix-ui/react-toggle-group';
import { Moon, Sun, Monitor } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { setMode } from '../../store/slices/themeSlice';
import { cn } from '../../utils/cn';

const OPTIONS = [
  { value: 'light', icon: Sun, label: 'Light' },
  { value: 'system', icon: Monitor, label: 'System' },
  { value: 'dark', icon: Moon, label: 'Dark' },
];

export function ThemeToggle() {
  const dispatch = useAppDispatch();
  const mode = useAppSelector((s) => s.theme.mode);

  return (
    <ToggleGroup.Root
      type="single"
      value={mode}
      onValueChange={(v) => v && dispatch(setMode(v))}
      aria-label="Theme"
      className="inline-flex items-center rounded-full border border-border bg-surface/60 p-1 backdrop-blur"
    >
      {OPTIONS.map(({ value, icon: Icon, label }) => (
        <ToggleGroup.Item
          key={value}
          value={value}
          aria-label={label}
          className={cn(
            'flex h-7 w-7 items-center justify-center rounded-full text-text-muted transition-colors',
            'data-[state=on]:bg-primary data-[state=on]:text-text-inverse data-[state=on]:shadow-glow-primary',
          )}
        >
          <Icon className="h-3.5 w-3.5" />
        </ToggleGroup.Item>
      ))}
    </ToggleGroup.Root>
  );
}
