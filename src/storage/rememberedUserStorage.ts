import type { RememberedUser } from '../features/auth/types';

const key = 'modal-auth.remembered-user';

export function getRememberedUser(): RememberedUser | null {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(key) ?? 'null');
    if (value && typeof value === 'object' && 'email' in value && 'name' in value
      && typeof value.email === 'string' && typeof value.name === 'string') {
      return { email: value.email, name: value.name };
    }
  } catch { /* Remembering an identity is optional when storage is unavailable. */ }
  return null;
}

export function setRememberedUser(user: RememberedUser) {
  try { localStorage.setItem(key, JSON.stringify({ email: user.email, name: user.name })); } catch { /* Optional preference. */ }
}

export function clearRememberedUser() {
  try { localStorage.removeItem(key); } catch { /* Optional preference. */ }
}
