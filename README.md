# Orvixa

## Local Razorpay test checkout

Checkout uses Razorpay Standard Checkout for payment methods enabled on the Razorpay test account (including UPI when enabled). Payment orders are created and signatures verified by the local Node API; the Razorpay secret is never sent to the browser.

1. Copy `.env.example` to `.env` and set `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` to test credentials from the Razorpay Dashboard. Keep `PAYMENT_MODE=test`.
2. In one terminal, run `npm run dev:payment`.
3. In another terminal, run `npm run dev` and open the local storefront.

The checkout intentionally rejects live Razorpay keys. Product prices and order history are currently managed in browser storage, not a trusted persistent catalog/database, so this integration is for test-mode checkout only. Do not use it to accept real payments or treat browser-local order data as a production order system.

## Supabase email and phone OTP authentication

1. Copy `.env.example` to `.env` (or append the variables to the `.env` already used for Razorpay) and set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from the Supabase project API settings. The anon/publishable key is intended for browser use; never put a Supabase service-role key in a `VITE_` variable.
2. In Supabase Authentication settings, enable Email and Phone providers. Configure an SMS provider for phone OTP. To send a numeric email OTP, set the Supabase email template to include `{{ .Token }}` rather than only a magic-link action URL.
3. Add your local development URL to Supabase's allowed redirect/site URLs if required, restart Vite after editing `.env`, then open `/login`.

The login page supports sign-in and registration by email OTP or Indian mobile SMS OTP. Supabase creates the session only after the code is verified; without project configuration the form stays safely disabled instead of pretending an OTP was sent.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
