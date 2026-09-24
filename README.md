# Authentication modal demo

A small React + TypeScript application demonstrating Supabase username-or-email/password authentication through accessible native dialogs. Vite runs the app, React Router provides the single application route, and Redux Toolkit holds authentication and modal state. Form fields stay in local React state. Vitest and React Testing Library cover the key flows.

**Styling is intentionally omitted.** There are no CSS files, inline styles, or styling classes. The UI will later be styled against the provided Figma design. Native browser controls, dialog backdrop, and fieldset borders are browser defaults.

## Static images and resources

Put static files in `public/`. Vite serves them from the site root and copies them into the production build unchanged.

```text
public/
  images/       # Hero images, backgrounds, and other images
  favicons/     # Favicon sizes and app icons
  robots.txt    # Add here when needed
  favicon.ico   # Optional default browser favicon
  site.webmanifest  # Optional web app manifest
```

For example, `public/images/hero.webp` is referenced as `/images/hero.webp` in JSX (`<img src="/images/hero.webp" alt="..." />`). Do not include `public` in the URL. Add favicon and manifest links in `index.html` after adding their files, such as `<link rel="icon" href="/favicons/favicon.svg" type="image/svg+xml" />`.

The `images/` and `favicons/` folders are ready to use; the root files shown above are examples to add when needed.

## Buttons

All buttons use `src/components/Button.tsx`. The component accepts native button props, including `disabled`, `onClick`, `className`, and `ref`. It defaults to `type="button"`; form submission buttons explicitly use `type="submit"`.

```tsx
<Button type="submit">Save</Button>
<Button onClick={onClose}>Close</Button>
<Button onClick={onBack}>Back to login</Button>
```

## SVG icons

Place SVG source files in `src/assets/icons/` using lowercase kebab-case names and a `viewBox`. Run `npm run icons` to regenerate `public/icons.svg`; this also runs automatically before `npm run dev` and `npm run build`. After adding or editing icons while the dev server is running, rerun `npm run icons` and refresh the page.

Use `<Icon name="close-eye" />` (import from `src/components/Icon`) or `<Icon name="close" label="Close" width={16} height={16} />`. Icon names come from filenames. Unlabelled icons are decorative; label meaningful standalone icons. The home page includes a closed-eye demo.

Generated symbols omit root width/height and fixed fill colors, retain their viewBox, and inherit color through `currentColor` on the Icon component. Child `fill="none"` is retained for hollow shapes, and shape dimensions are retained to avoid breaking rectangles and masks. Stroke colors become `currentColor`. Sources remain untouched. Embedded CSS is rejected; use presentation attributes. The generated sprite is ignored by Git and rebuilt from the source files.

## Local setup

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
6. In **Authentication → Sign In / Providers → Email**, enable **Require current password when updating** (enabled for the connected project). The Change password modal sends `current_password` with the new password so Supabase checks it on the server. Recovery sessions remain exempt from this requirement.

Name is stored in the auth user's `user_metadata.name`. Username authentication also needs the migration and Edge Function below.

### Username backend

This backend is deployed to the configured `modal-auth` project. The migration, private resolver permissions, username constraints, and rate limit have been verified. The steps below are for setting up another project; do not rerun the migration on this one.

1. Apply `supabase/migrations/202609240001_usernames.sql` once in the project's SQL editor (or with the Supabase CLI migration workflow).
2. Deploy `supabase/functions/username-login/index.ts` as the `username-login` Edge Function. For CLI deployment: `supabase functions deploy username-login --project-ref YOUR_PROJECT_REF`. The checked-in `supabase/config.toml` sets `verify_jwt = false` for this function because login happens before a user has a session. If deploying through the dashboard, disable **Verify JWT with legacy secret** for this function. It still verifies passwords using Supabase Auth before issuing any session.
3. The hosted function uses Supabase's automatically supplied `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`. Never copy the service-role key into Vite environment variables. No additional browser key is needed.
4. Run `supabase/tests/usernames.sql` to verify database uniqueness, username ownership, permissions, and rate limiting. It creates synthetic records inside a transaction and rolls everything back.

Usernames are required for new accounts, contain 3–30 ASCII letters, numbers, or underscores, and are stored lowercase. `John_Doe` and `john_doe` identify the same account. A database trigger reserves the username in the same transaction as account creation; concurrent signups cannot claim the same username. Availability is checked before signup for a field-specific error, with the database constraint as the final authority. Dashboard/admin-created users also need valid `username` user metadata.

The private username registry stores only the username and auth user ID. Browser roles cannot read it or call the email resolver. The public availability RPC returns only a boolean. The Edge Function resolves the current email on the server, authenticates with Supabase Auth, and returns session tokens only after successful authentication of a verified account. The browser passes these directly to `supabase.auth.setSession()` so the SDK remains responsible for storage and refresh. No public username-to-email endpoint exists.

Username attempts are limited to 10 per username per five minutes, including unknown usernames. Supabase's Auth rate limits also apply. Old attempt counters are removed on subsequent requests after one day. Account-based limits can temporarily block legitimate login after repeated failed attempts; the email login path remains available.

Existing accounts without usernames continue using email login. This migration deliberately does not invent usernames or alter existing accounts. Username changes are not implemented; editing user metadata does not change the registered login identity. Forgotten-password requests still use email.

The local environment is connected to the `modal-auth` Supabase project. Email confirmation is enabled and the minimum password length is 8. Redirects allow both `127.0.0.1` and `localhost` on development port 5173 and preview port 4173. Prefer `127.0.0.1`: this browser has an older Reminder service worker on `localhost:5173`.

Custom SMTP is currently not configured. Supabase's built-in sender only delivers to project organization team members and allows 2 emails per hour. To test sign-up and recovery with other email addresses, configure your own SMTP provider in Authentication → Emails → SMTP Settings. See [Supabase's SMTP documentation](https://supabase.com/docs/guides/auth/auth-smtp).

The browser client uses Supabase's implicit redirect flow. Confirmation and recovery emails return to `/`, where the SDK processes the callback fragment. `PASSWORD_RECOVERY` opens the reset dialog through Redux. Ordinary modal navigation never changes the URL. No `/login`, `/register`, or modal query parameters exist.

See the official [password recovery API](https://supabase.com/docs/reference/javascript/auth-resetpasswordforemail) and [auth events](https://supabase.com/docs/reference/javascript/auth-onauthstatechange).

## Try the flows

For styling and demonstrations, visit `/ui` (or use **UI showcase** in the header). Each modal has its own button, including Welcome Back, all success states, and the invalid-link state. The page reuses the real components with an isolated preview store. Forms validate normally and simulate successful transitions; they never call Supabase, send emails, change passwords, or alter your real session or remembered identity. Modal selection stays in application state, without URL parameters. Refreshing `/ui` starts with every modal closed.

- Open **Log in**, choose **Register**, and enter a name, unique username, email, and password. A separate success dialog asks you to check your email. Existing accounts may receive the same neutral response because Supabase deliberately hides account existence.
- Verify the account using the email. Supabase may establish a verified session after confirmation. If necessary, log out, then log in with either the username or verified email and password. The welcome message displays the saved name.
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
- `src/test/`: behavior tests mocking the auth service, plus session-startup, service-boundary, and Edge Function handler tests. jsdom stubs the native dialog API; actual browser focus containment relies on native dialog support.
- `supabase/`: private username registry migration, transactional SQL checks, and the username login Edge Function.

The remembered preference stores only `{ email, name }` after successful password login, email-verification sign-in, or restoration of a verified session. Logout retains it. **Not you?** clears it. This is a convenience preference, not authentication; avoid remembering an identity on a shared browser if that information should not remain visible. Storage failures do not prevent login.

Supabase alone stores and refreshes its authentication tokens. Redux contains only a minimal user identity, status, and UI state. A non-secret recovery-pending flag in session storage preserves the reset flow across refreshes in the same tab. No passwords or SDK tokens are manually copied to storage or Redux.

Live email delivery and real account operations require your Supabase project and credentials; automated tests use mocks and do not send email.
