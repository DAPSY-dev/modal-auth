import { useEffect } from 'react';
import { Modal } from '../components/Modal';

export function AccountFrozenPreview({ onClose }: { onClose: () => void }) {
  useEffect(() => { document.getElementById('auth-title')?.focus(); }, []);

  return <Modal busy={false} onClose={onClose} closeLabel="Ok">
    <h2 id="auth-title" tabIndex={-1}>Account frozen</h2>
    <p>Your account has been temporarily blocked because you exceeded the number of login attempts with the wrong password. Do not hesitate to contact us via Live Chat in case of any questions or issues</p>
  </Modal>;
}
