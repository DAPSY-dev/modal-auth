export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

export type RememberedUser = Pick<AuthUser, 'email' | 'name'>;

export type AuthModalState =
  | 'login'
  | 'welcomeBack'
  | 'register'
  | 'registrationSuccess'
  | 'forgotPassword'
  | 'forgotPasswordSuccess'
  | 'resetPassword'
  | 'resetPasswordSuccess'
  | 'changePassword'
  | 'changePasswordSuccess'
  | 'callbackError'
  | null;
