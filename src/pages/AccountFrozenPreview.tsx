import { Button } from '../components/Button';
import { useEffect } from 'react';
import { Title } from '../components/Title';
import { Stack } from '../components/Stack';
import { Modal } from '../components/Modal';

export function AccountFrozenPreview({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    document.getElementById('auth-title')?.focus();
  }, []);

  return (
    <Modal busy={false} onClose={onClose}>
      <Stack size="l">
        <Title id="auth-title" tabIndex={-1} className="text-center">
          Account frozen
        </Title>
        <p className="no-margin text-14 lh-130 text-secondary">
          Your account has been temporarily blocked because you exceeded the
          number of login attempts with the wrong password. Do not hesitate to
          contact us via Live Chat in case of any questions or issues
        </p>
        <Button
          type="button"
          variant="primary"
          size="m"
          onClick={onClose}
          className="full-inline-size"
        >
          Ok
        </Button>
      </Stack>
    </Modal>
  );
}
