import { useEffect, useRef, type ReactNode } from 'react';

export function Modal({ children, onClose, busy, closeLabel = 'Close' }: { children: ReactNode; onClose: () => void; busy: boolean; closeLabel?: string }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const trigger = document.activeElement;
    const dialog = ref.current!;
    dialog.showModal();
    return () => {
      dialog.close();
      if (trigger instanceof HTMLElement && trigger.isConnected) trigger.focus();
    };
  }, []);
  return (
    <dialog ref={ref} aria-labelledby="auth-title" aria-modal="true" onCancel={(event) => {
      event.preventDefault();
      if (!busy) onClose();
    }}>
      {children}
      <button type="button" disabled={busy} onClick={onClose}>{closeLabel}</button>
    </dialog>
  );
}
