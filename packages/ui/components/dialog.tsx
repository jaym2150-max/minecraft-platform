import React, {
  createContext,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

interface DialogContextValue {
  titleId: string;
  descriptionId: string;
  hasTitle: boolean;
  hasDescription: boolean;
  setHasTitle: (has: boolean) => void;
  setHasDescription: (has: boolean) => void;
}

const DialogContext = createContext<DialogContextValue | null>(null);

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  /**
   * Optional id of the element labelling the dialog. When omitted and a
   * DialogTitle child is present, the title element's auto-generated id is
   * used so screen readers announce the dialog title on open.
   */
  'aria-labelledby'?: string;
  /**
   * Optional id of the element describing the dialog. Same auto-generation
   * behaviour as aria-labelledby via DialogDescription.
   */
  'aria-describedby'?: string;
}

function useDialogAriaIds(explicitTitleId?: string, explicitDescriptionId?: string) {
  const generatedTitleId = useId();
  const generatedDescriptionId = useId();
  const [hasTitle, setHasTitle] = useState(false);
  const [hasDescription, setHasDescription] = useState(false);

  const value = useMemo<DialogContextValue>(
    () => ({
      titleId: explicitTitleId ?? generatedTitleId,
      descriptionId: explicitDescriptionId ?? generatedDescriptionId,
      hasTitle,
      hasDescription,
      setHasTitle,
      setHasDescription,
    }),
    [
      explicitTitleId,
      explicitDescriptionId,
      generatedTitleId,
      generatedDescriptionId,
      hasTitle,
      hasDescription,
    ],
  );

  return value;
}

/**
 * Minimal focus trap that:
 *  - on open, stashes the previously-active element so we can return focus
 *    there on close;
 *  - moves focus into the dialog (first focusable, or the dialog element);
 *  - captures Tab/Shift+Tab so focus wraps inside the dialog instead of
 *    leaking onto the (now hidden / blocked) page behind the overlay.
 *
 * C51 (AUDIT.md): we don't depend on @radix-ui/react-dialog here to avoid
 * adding a new transitive dep surface; this trap covers the keyboard
 * accessibility regression the audit flagged. Pointer users can still
 * click the backdrop to dismiss (below). The trap is a single dialog at a
 * time (data-modal="true"); nested dialogs would need a stack which we have
 * no usage of yet.
 */
function useFocusTrap(open: boolean) {
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const container = containerRef.current;
    if (!container) return;

    const focusables = (): HTMLElement[] => {
      const sel = [
        'a[href]',
        'button:not([disabled])',
        'textarea',
        'input',
        'select',
        '[tabindex]:not([tabindex="-1"])',
      ].join(',');
      return Array.from(container.querySelectorAll<HTMLElement>(sel)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement,
      );
    };

    const moveIn = () => {
      const first = focusables()[0];
      if (first) {
        first.focus();
      } else {
        // No focusable child — make the dialog itself tabbable so screen
        // readers announce it and Escape + backdrop still work.
        container.setAttribute('tabindex', '-1');
        container.focus();
      }
    };
    moveIn();

    const onKeydown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const items = focusables();
      if (items.length === 0) {
        e.preventDefault();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (e.shiftKey) {
        if (active === first || !container.contains(active)) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (active === last || !container.contains(active)) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    container.addEventListener('keydown', onKeydown);
    return () => {
      container.removeEventListener('keydown', onKeydown);
      // Restore focus to whatever opened the dialog (eg. the action button)
      // so a screen reader user lands back on a known location.
      previouslyFocused?.focus?.();
    };
  }, [open]);

  return containerRef;
}

export function Dialog({
  open,
  onOpenChange,
  children,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
}: DialogProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false);
    };
    if (open) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [open, onOpenChange]);

  const containerRef = useFocusTrap(open);
  const ctx = useDialogAriaIds(ariaLabelledBy, ariaDescribedBy);

  if (!open) return null;

  // Only forward the auto-generated id if the corresponding slot rendered;
  // this keeps the dialog from referencing non-existent nodes when callers
  // omit DialogTitle/DialogDescription.
  const labelledBy = ariaLabelledBy ?? (ctx.hasTitle ? ctx.titleId : undefined);
  const describedBy = ariaDescribedBy ?? (ctx.hasDescription ? ctx.descriptionId : undefined);

  return (
    <DialogContext.Provider value={ctx}>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          onClick={() => onOpenChange(false)}
          aria-hidden="true"
        />
        <div
          ref={containerRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={labelledBy}
          aria-describedby={describedBy}
          className="bg-background relative mx-4 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border shadow-2xl outline-none"
        >
          {children}
        </div>
      </div>
    </DialogContext.Provider>
  );
}

export function DialogContent({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`p-6 ${className}`}>{children}</div>;
}

export function DialogHeader({ children }: { children: React.ReactNode }) {
  return <div className="mb-4">{children}</div>;
}

export function DialogTitle({ children, id }: { children: React.ReactNode; id?: string }) {
  const ctx = useContext(DialogContext);
  const fallbackId = useId();
  useIsomorphicLayoutEffect(() => {
    if (ctx) ctx.setHasTitle(true);
    return () => {
      if (ctx) ctx.setHasTitle(false);
    };
  }, [ctx]);
  const resolvedId = id ?? ctx?.titleId ?? fallbackId;
  return (
    <h2 id={resolvedId} className="text-lg font-semibold">
      {children}
    </h2>
  );
}

export function DialogDescription({ children, id }: { children: React.ReactNode; id?: string }) {
  const ctx = useContext(DialogContext);
  const fallbackId = useId();
  useIsomorphicLayoutEffect(() => {
    if (ctx) ctx.setHasDescription(true);
    return () => {
      if (ctx) ctx.setHasDescription(false);
    };
  }, [ctx]);
  const resolvedId = id ?? ctx?.descriptionId ?? fallbackId;
  return (
    <p id={resolvedId} className="text-muted-foreground mt-1 text-sm">
      {children}
    </p>
  );
}

export function DialogFooter({ children }: { children: React.ReactNode }) {
  return <div className="mt-6 flex items-center justify-end gap-2 border-t pt-4">{children}</div>;
}
