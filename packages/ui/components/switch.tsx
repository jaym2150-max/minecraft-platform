import * as React from 'react';
import { cn } from './utils';

interface SwitchProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  // C52 (AUDIT.md): fully controlled. The previous implementation kept an
  // internal `useState(checked)` mirrored by a `useEffect` that re-synced
  // on prop changes — that created an optimistic drift where an
  // uncontrolled parent (passing `checked` once, never reading
  // `onCheckedChange`) re-rendered with the prop value, overwriting any
  // click the user had just made internal-state-side. Drop the local state:
  // the rendered `aria-checked` and visual now always reflect the prop, and
  // the only side effect of a click is `onCheckedChange(newValue)`. This
  // matches Radix Switch semantics.
  ({ className, checked = false, onCheckedChange, onClick, ...props }, ref) => {
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      onCheckedChange?.(!checked);
      onClick?.(event);
    };

    return (
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        data-state={checked ? 'checked' : 'unchecked'}
        ref={ref}
        onClick={handleClick}
        className={cn(
          'focus-visible:ring-ring focus-visible:ring-offset-background peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          checked ? 'bg-primary' : 'bg-input',
          className,
        )}
        {...props}
      >
        <span
          data-state={checked ? 'checked' : 'unchecked'}
          className={cn(
            'bg-background pointer-events-none block h-4 w-4 rounded-full shadow-lg ring-0 transition-transform',
            checked ? 'translate-x-4' : 'translate-x-0',
          )}
        />
      </button>
    );
  },
);
Switch.displayName = 'Switch';

export { Switch };
