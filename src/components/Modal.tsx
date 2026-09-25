import { Button } from './Button';
import { useEffect, useRef, type ReactNode } from 'react';
import { Icon } from './Icon';

export function Modal({
  children,
  onClose,
  busy,
}: {
  children: ReactNode;
  onClose: () => void;
  busy: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const trigger = document.activeElement;
    const dialog = ref.current!;
    dialog.showModal();
    return () => {
      dialog.close();
      if (trigger instanceof HTMLElement && trigger.isConnected)
        trigger.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      aria-labelledby="auth-title"
      aria-modal="true"
      onCancel={(event) => {
        event.preventDefault();
        if (!busy) onClose();
      }}
      className="modal"
    >
      <div className="modal__inner">
        <Button
          type="button"
          disabled={busy}
          onClick={onClose}
          className="modal__close"
        >
          <Icon name="close" />
          <span className="visually-hidden">Close</span>
        </Button>
        {children}
      </div>
    </dialog>
  );
}
