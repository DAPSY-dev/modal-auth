export function validateEmail(email: string): string | undefined {
  if (!email.trim()) return 'Please enter your email.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return 'Please enter a valid email address.';
}

export function validatePassword(password: string): string | undefined {
  if (!password) return 'Please enter your password.';
}

export function validateNewPassword(password: string): string | undefined {
  if (!password) return 'Please enter a new password.';
  if (password.length < 8) return 'Use at least 8 characters for your password.';
}

export function validateConfirmation(password: string, confirmation: string): string | undefined {
  if (!confirmation) return 'Please confirm your new password.';
  if (password !== confirmation) return 'The passwords do not match.';
}
