# Authentication modal demo

A small React + TypeScript application demonstrating Supabase email/password authentication through accessible native dialogs. Vite runs the app, React Router provides the single application route, and Redux Toolkit holds authentication and modal state. Form fields stay in local React state. Vitest and React Testing Library cover the key flows.

**Styling is intentionally omitted.** There are no CSS files, inline styles, or styling classes. The UI will later be styled against the provided Figma design. Native browser controls, dialog backdrop, and fieldset borders are browser defaults.

## Run locally

Use Node.js 22.12+ (tested with Node 24) and npm:

```sh
npm install
```

Copy `.env.example` to `.env.local`, then replace both placeholders:

```dotenv
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-anon-or-publishable-key
```

Use a Supabase public anon/publishable key, never a secret or service-role key. Vite exposes these variables to the browser. Real environment files are ignored by Git.

```sh
npm run dev
```

Open http://127.0.0.1:5173. Use this origin consistently; `localhost` and `127.0.0.1` have different browser storage. Restart Vite after editing environment variables. Without configuration you can explore the dialogs, but authentication requests show a configuration error. There is no fake authentication fallback.

```sh
npm test
npm run test:watch
npm run build
npm run preview
```

This is a Vite app, not a PHP application. Being in an XAMPP folder does not make Apache compile TypeScript; use the Vite URL for development. Preview uses port 4173 and requires that origin in Supabase's redirect allowlist if testing auth there.

## Supabase setup

1. Create a Supabase project and copy its project URL and public key into `.env.local`.
2. Enable the email provider and **Confirm email** in Authentication. Email verification is required. The application rejects unverified users and treats an immediate session from registration as a configuration error; the server setting must still be enabled.
3. Set the Site URL to `http://127.0.0.1:5173/` and allow the redirect URL `http://127.0.0.1:5173/` in Authentication → URL Configuration. Add any other exact origins used for development or deployment.
4. Keep the default confirmation and recovery email templates using `{{ .ConfirmationURL }}`. Configure email delivery/SMTP as appropriate for your project. Supabase's built-in email delivery can restrict recipients and impose rate limits.
5. Set a minimum password length of at least 8 in Supabase. The forms also enforce 8 characters; Supabase enforces any additional configured password rules.

No database tables or custom backend are needed. Name is stored in the auth user's `user_metadata.name`.

The local environment is connected to the `modal-auth` Supabase project. Email confirmation is enabled and the minimum password length is 8. Redirects allow both `127.0.0.1` and `localhost` on development port 5173 and preview port 4173. Prefer `127.0.0.1`: this browser has an older Reminder service worker on `localhost:5173`.

Custom SMTP is currently not configured. Supabase's built-in sender only delivers to project organization team members and allows 2 emails per hour. To test sign-up and recovery with other email addresses, configure your own SMTP provider in Authentication → Emails → SMTP Settings. See [Supabase's SMTP documentation](https://supabase.com/docs/guides/auth/auth-smtp).

The browser client uses Supabase's implicit redirect flow. Confirmation and recovery emails return to `/`, where the SDK processes the callback fragment. `PASSWORD_RECOVERY` opens the reset dialog through Redux. Ordinary modal navigation never changes the URL. No `/login`, `/register`, or modal query parameters exist.

See the official [password recovery API](https://supabase.com/docs/reference/javascript/auth-resetpasswordforemail) and [auth events](https://supabase.com/docs/reference/javascript/auth-onauthstatechange).

## Try the flows

- Open **Log in**, choose **Register**, and enter a name, email, and password. A separate success dialog asks you to check your email. Existing accounts may receive the same neutral response because Supabase deliberately hides account existence.
- Verify the account using the email. Supabase may establish a verified session after confirmation. If necessary, log out, then log in with the verified email and password. The welcome message displays the saved name.
- Refresh while logged in: a session check appears until Supabase restores the session.
- Log out, then reopen login: **Welcome back** asks only for a password. **Not you?** clears the preference and shows the normal email/password form.
- Choose **Forgot password?** and request instructions. The confirmation does not reveal whether that email has an account.
- Follow the recovery email, enter matching new passwords, and save. The app ends the recovery session before showing success, then offers **Back to login**. It never intentionally turns password recovery into a normal login. Closing the recovery dialog also ends that session. A failed sign-out can be retried without changing the password twice.
- Try an invalid password, mismatched reset passwords, an expired email link, and a disconnected network to check errors and loading states.

Use Tab/Shift+Tab to move through controls and Escape to close a dialog. Native `showModal()` supplies focus containment and makes the background inert. Dialog transitions focus their heading; closing returns focus to the account control. Closing and navigation are disabled while a request is pending.

Forms use custom field validation instead of browser validation popups. Each field shows an accessible error on blur or submit, then updates it while you edit. Invalid submission focuses the first invalid field and does not call Supabase. Password mismatch belongs to the confirmation field. General service and login-credential errors remain at the form level.

## Organization

- `src/services/`: Supabase initialization, operations, session events, and readable errors. Only this layer calls Supabase.
- `src/features/auth/`: Redux state, session startup, a shared request lock, and separate form/success components.
- `src/components/`: labeled input and native dialog primitives. Plain buttons need no abstraction.
- `src/storage/rememberedUserStorage.ts`: optional non-sensitive remembered identity storage.
- `src/app/`: store and router; `App.tsx` supplies the minimal header and welcome message.
- `src/test/`: behavior tests mocking the auth service, plus session-startup and service-boundary tests. jsdom stubs the native dialog API; actual browser focus containment relies on native dialog support.

The remembered preference stores only `{ email, name }` after successful password login. Logout retains it. **Not you?** clears it. This is a convenience preference, not authentication; avoid remembering an identity on a shared browser if that information should not remain visible. Storage failures do not prevent login.

Supabase alone stores and refreshes its authentication tokens. Redux contains only a minimal user identity, status, and UI state. A non-secret recovery-pending flag in session storage preserves the reset flow across refreshes in the same tab. No passwords or SDK tokens are manually copied to storage or Redux.

Live email delivery and real account operations require your Supabase project and credentials; automated tests use mocks and do not send email.
