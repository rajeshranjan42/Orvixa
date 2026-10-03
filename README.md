# Orvixa

## Local Razorpay test checkout

Checkout uses Razorpay Standard Checkout for payment methods enabled on the Razorpay test account (including UPI when enabled). Payment orders are created and signatures verified by the local Node API; the Razorpay secret is never sent to the browser.

1. Copy `.env.example` to `.env` and set `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` to test credentials from the Razorpay Dashboard. Keep `PAYMENT_MODE=test`.
2. In one terminal, run `npm run dev:payment`.
3. In another terminal, run `npm run dev` and open the local storefront.

The checkout intentionally rejects live Razorpay keys. Product prices and order history are currently managed in browser storage, not a trusted persistent catalog/database, so this integration is for test-mode checkout only. Do not use it to accept real payments or treat browser-local order data as a production order system.

## Supabase email and phone OTP authentication

1. Copy `.env.example` to `.env` and set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` using the Supabase project API settings. The anon/publishable key is designed for browser use; never expose a Supabase service-role key in a `VITE_` variable.
2. In Supabase Authentication settings, enable Email and Phone providers. Configure an SMS provider for phone OTP. To send numeric email codes, make sure the Supabase email template includes `{{ .Token }}`.
3. Add the local development URL to Supabase's allowed site URLs if required, restart Vite after changing `.env`, then open `/login`.

Login and registration use Supabase Auth directly, so no separate Orvixa auth server is needed. Email and phone OTP delivery depends on your Supabase provider configuration and limits.

### Enable sign-in on GitHub Pages

1. In the GitHub repository, open **Settings → Secrets and variables → Actions → New repository secret**.
2. Add `VITE_SUPABASE_URL` with the Supabase project URL and `VITE_SUPABASE_ANON_KEY` with the project's anon/publishable key. Do not use the Supabase service-role key.
3. In **Actions**, rerun **Deploy to GitHub Pages** (or push a new commit). The login page enables OTP after the deployment is complete.
4. In Supabase Authentication settings, enable Email sign-in. For phone OTP, also enable Phone and configure an SMS provider.

Vite embeds the anon/publishable key in the public site bundle, as required for browser authentication. Supabase Row Level Security and authentication settings must protect project data.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
