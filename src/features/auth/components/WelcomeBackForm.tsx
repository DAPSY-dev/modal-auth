import { useAppDispatch } from '../../../app/store';
import { clearRememberedUser } from '../../../storage/rememberedUserStorage';
import { forgetUser, showModal } from '../authSlice';
import type { RememberedUser } from '../types';
import { LoginForm } from './LoginForm';

export function WelcomeBackForm({ user }: { user: RememberedUser }) {
  const dispatch = useAppDispatch();
  return <LoginForm rememberedUser={user} onSwitchAccount={() => {
    clearRememberedUser(); dispatch(forgetUser()); dispatch(showModal('login'));
  }} />;
}
