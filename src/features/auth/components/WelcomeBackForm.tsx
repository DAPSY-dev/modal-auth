import { useAppDispatch } from '../../../app/store';
import { clearRememberedUser } from '../../../storage/rememberedUserStorage';
import { forgetUser, showModal } from '../authSlice';
import type { RememberedUser } from '../types';
import { LoginForm } from './LoginForm';

export function WelcomeBackForm({ user, preview = false }: { user: RememberedUser; preview?: boolean }) {
  const dispatch = useAppDispatch();
  return <LoginForm preview={preview} rememberedUser={user} onSwitchAccount={() => {
    if (preview) { dispatch(showModal('login')); return; }
    clearRememberedUser(); dispatch(forgetUser());
  }} />;
}
