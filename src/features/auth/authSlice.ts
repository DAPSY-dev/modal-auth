import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AuthModalState, AuthUser, RememberedUser } from './types';
import type { SessionState } from '../../services/authService';
import { getRememberedUser } from '../../storage/rememberedUserStorage';

interface AuthState {
  user: AuthUser | null;
  status: 'initializing' | 'ready';
  modal: AuthModalState;
  rememberedUser: RememberedUser | null;
  recovery: boolean;
  busy: boolean;
  startupError: string | null;
}

const initialState = (): AuthState => ({
  user: null, status: 'initializing', modal: null,
  rememberedUser: getRememberedUser(), recovery: false, busy: false, startupError: null,
});

const slice = createSlice({
  name: 'auth', initialState,
  reducers: {
    sessionReceived(state, { payload }: PayloadAction<SessionState>) {
      state.status = 'ready';
      state.startupError = null;
      state.user = payload.user;
      state.recovery = payload.recovery;
      if (payload.invalidLink) state.modal = 'callbackError';
      else if (payload.recovery) state.modal = 'resetPassword';
    },
    startupFailed(state, { payload }: PayloadAction<string>) {
      state.status = 'ready'; state.startupError = payload;
    },
    showModal(state, { payload }: PayloadAction<AuthModalState>) { state.modal = payload; },
    setBusy(state, { payload }: PayloadAction<boolean>) { state.busy = payload; },
    signedIn(state, { payload }: PayloadAction<AuthUser>) {
      state.startupError = null;
      state.user = payload; state.rememberedUser = { email: payload.email, name: payload.name };
      state.modal = null; state.recovery = false;
    },
    signedOut(state) { state.user = null; state.recovery = false; },
    forgetUser(state) { state.rememberedUser = null; },
  },
});

export const { sessionReceived, startupFailed, showModal, setBusy, signedIn, signedOut, forgetUser } = slice.actions;
export default slice.reducer;
