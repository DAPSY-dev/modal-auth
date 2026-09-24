import { Button } from '../components/Button';
import { useEffect } from 'react';
import { Input } from '../components/Input';
import { Modal } from '../components/Modal';

export function UsernameRecoveryPreview({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    document.getElementById('auth-title')?.focus();
  }, []);

  return (
    <Modal busy={false} onClose={onClose}>
      <h2 id="auth-title" tabIndex={-1}>
        Forgot username?
      </h2>
      <p>
        Fill in your e-mail address and we will send you your username via
        e-mail.
      </p>
      <p id="username-recovery-notice">
        This is a dummy modal for UI preview only. No email will be sent.
      </p>
      <form
        noValidate
        aria-label="Username recovery preview"
        aria-describedby="username-recovery-notice"
        onSubmit={(event) => event.preventDefault()}
      >
        <Input label="Email" name="email" type="email" autoComplete="email" />
        <Button type="submit" disabled>
          Send username
        </Button>
      </form>
    </Modal>
  );
}
