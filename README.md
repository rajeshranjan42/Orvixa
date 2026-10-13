# Orvixa

## Local Razorpay test checkout

Checkout uses Razorpay Standard Checkout for payment methods enabled on the Razorpay test account (including UPI when enabled). Payment orders are created and signatures verified by the local Node API; the Razorpay secret is never sent to the browser.

1. Copy `.env.example` to `.env` and set `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` to test credentials from the Razorpay Dashboard. Keep `PAYMENT_MODE=test`.
2. In one terminal, run `npm run dev:payment`.
3. In another terminal, run `npm run dev` and open the local storefront.

Prices may include paise (for example `₹1,299.50`); the browser sends the order total to the API in whole paise. If a payment is only `authorized` (auto-capture disabled on the Razorpay account), the API captures it during verification.

### Hosted storefront (GitHub Pages)

GitHub Pages serves static files only, so checkout is disabled on the hosted site unless a payment API is deployed separately. To enable it, run `server/payment-api.js` on a Node host with `PAYMENT_API_HOST=0.0.0.0` and `PAYMENT_ALLOWED_ORIGINS=https://rajeshranjan42.github.io`, then set the `VITE_PAYMENT_API_URL` repository variable (Settings → Secrets and variables → Actions → Variables) to that API's base URL.

The checkout intentionally rejects live Razorpay keys. Product prices and order history are currently managed in browser storage, not a trusted persistent catalog/database, so this integration is for test-mode checkout only. Do not use it to accept real payments or treat browser-local order data as a production order system.

## Supabase email and phone OTP authentication

1. Copy `.env.example` to `.env` and set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` using the Supabase project API settings. The anon/publishable key is designed for browser use; never expose a Supabase service-role key in a `VITE_` variable.
2. In Supabase Authentication settings, enable Email and Phone providers. Configure an SMS provider for phone OTP. To send numeric email codes, make sure the Supabase email template includes `{{ .Token }}`.
3. Add the local development URL to Supabase's allowed site URLs if required, restart Vite after changing `.env`, then open `/login`.

Login and registration use Supabase Auth directly, so no separate Orvixa auth server is needed. Email and phone OTP delivery depends on your Supabase provider configuration and limits.

### Enable sign-in on GitHub Pages

The Pages workflow uses `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` GitHub Actions secrets when configured. If those secrets are absent, it reads the same two public client settings from `.env.example`. The Supabase URL and anon/publishable key are browser configuration and are included in the public site; never use a service-role key.

In Supabase Authentication settings, enable Email sign-in. For phone OTP, also enable Phone and configure an SMS provider. Set the Supabase Site URL and allowed redirect URLs to `https://rajeshranjan42.github.io/Orvixa/`.

Never put a Razorpay key secret in `.env.example` or a `VITE_` variable. Keep payment secrets only in the ignored local `.env` used by the local payment server.

## Browser storage

The cart and admin dashboard data (products, banners, page content, demo orders) are stored in the browser's IndexedDB so uploaded product images are not limited by the ~5 MB localStorage quota. Data saved by older versions in localStorage is migrated automatically on first load, and changes sync between open tabs.
