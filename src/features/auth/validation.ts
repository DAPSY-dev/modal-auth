export function validateEmail(email: string): string | undefined {
  if (!email.trim()) return 'Please enter your email.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
    return 'Please enter a valid email address.';
}

export function validateUsername(username: string): string | undefined {
  if (!username.trim()) return 'Please enter a username.';
  if (!/^[a-zA-Z0-9_]{3,30}$/.test(username.trim()))
    return 'Use 3–30 letters, numbers, or underscores.';
}

export function validateLoginIdentifier(
  identifier: string,
): string | undefined {
  if (!identifier.trim()) return 'Please enter your username or email.';
  return identifier.includes('@')
    ? validateEmail(identifier)
    : validateUsername(identifier);
}

export function validatePassword(password: string): string | undefined {
  if (!password) return 'Please enter your password.';
}

export function validateNewPassword(password: string): string | undefined {
  if (!password) return 'Please enter a new password.';
  if (password.length < 8)
    return 'Use at least 8 characters for your password.';
}

export function validateConfirmation(
  password: string,
  confirmation: string,
): string | undefined {
  if (!confirmation) return 'Please confirm your new password.';
  if (password !== confirmation) return 'The passwords do not match.';
}
