import { useEffect, useRef, useState } from 'react'
import { isSupabaseConfigured } from '../lib/supabase'
import logo from '../assets/Images/logo.png'
import './login_page.css'

const OTP_LENGTH = 6
const RESEND_DELAY = 30

function getAuthErrorMessage(message) {
  const normalized = message.toLowerCase()
  if (normalized.includes('rate limit') || normalized.includes('too many requests')) {
    return 'Too many OTP requests. Please wait a few minutes and try again.'
  }
  if (normalized.includes('phone') && normalized.includes('provider')) {
    return 'Supabase rejected phone OTP because phone authentication is disabled or has no SMS provider. In your Supabase Dashboard, open Authentication → Sign In / Providers → Phone, enable Phone, configure an SMS provider (such as Twilio), and save. Then retry.'
  }
  if (normalized.includes('email') && normalized.includes('provider')) {
    return 'Email sign-in is not enabled for this Supabase project yet.'
  }
  return message
}

export const LoginPage = ({ client, user, isLoading = false, onAuthChange = () => {} }) => {
  const [mode, setMode] = useState('login')
  const [method, setMethod] = useState('email')
  const [step, setStep] = useState('details')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [destination, setDestination] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [secondsLeft, setSecondsLeft] = useState(0)
  const otpInput = useRef(null)
  const isConfigured = isSupabaseConfigured && Boolean(client)

  useEffect(() => {
    if (secondsLeft <= 0) return undefined
    const timer = window.setTimeout(() => setSecondsLeft((seconds) => seconds - 1), 1000)
    return () => window.clearTimeout(timer)
  }, [secondsLeft])

  useEffect(() => {
    if (step === 'otp') otpInput.current?.focus()
  }, [step])

  const normalizedAddress = method === 'email'
    ? email.trim().toLowerCase()
    : `+91${phone.replace(/\D/g, '')}`

  const sendOtp = async (event) => {
    event.preventDefault()
    if (busy) return
    if (!isConfigured) {
      setError('Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env, then restart Vite to enable sign-in.')
      return
    }

    setBusy(true)
    setError('')
    setNotice('')
    try {
      const options = {
        shouldCreateUser: mode === 'register',
        ...(mode === 'register' ? { data: { full_name: name.trim() } } : {}),
      }
      const { error: authError } = method === 'email'
        ? await client.auth.signInWithOtp({ email: normalizedAddress, options })
        : await client.auth.signInWithOtp({ phone: normalizedAddress, options })
      if (authError) throw authError
      setDestination(normalizedAddress)
      setOtp('')
      setStep('otp')
      setSecondsLeft(RESEND_DELAY)
      setNotice(`We sent a 6-digit code to ${normalizedAddress}.`)
    } catch (authError) {
      setError(getAuthErrorMessage(authError.message || 'Could not send your code. Please try again.'))
    } finally {
      setBusy(false)
    }
  }

  const verifyOtp = async (event) => {
    event.preventDefault()
    if (!isConfigured || busy || otp.length !== OTP_LENGTH) return

    setBusy(true)
    setError('')
    try {
      const { data, error: authError } = method === 'email'
        ? await client.auth.verifyOtp({ email: destination, token: otp, type: 'email' })
        : await client.auth.verifyOtp({ phone: destination, token: otp, type: 'sms' })
      if (authError) throw authError
      if (!data.session) throw new Error('The code was accepted, but no signed-in session was returned. Please try again.')
      onAuthChange(data.session.user)
      setStep('success')
      setNotice('Your account is verified and ready.')
    } catch (authError) {
      setError(getAuthErrorMessage(authError.message || 'That code could not be verified. Check it and try again.'))
    } finally {
      setBusy(false)
    }
  }

  const resendOtp = async () => {
    if (secondsLeft > 0 || busy) return
    if (!isConfigured) {
      setError('Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env, then restart Vite to enable sign-in.')
      return
    }
    setBusy(true)
    setError('')
    setNotice('')
    try {
      const options = {
        shouldCreateUser: mode === 'register',
        ...(mode === 'register' ? { data: { full_name: name.trim() } } : {}),
      }
      const { error: authError } = method === 'email'
        ? await client.auth.signInWithOtp({ email: destination, options })
        : await client.auth.signInWithOtp({ phone: destination, options })
      if (authError) throw authError
      setSecondsLeft(RESEND_DELAY)
      setNotice(`A new code was sent to ${destination}.`)
    } catch (authError) {
      setError(getAuthErrorMessage(authError.message || 'Could not resend your code. Please try again.'))
    } finally {
      setBusy(false)
    }
  }

  const signOut = async () => {
    if (!client || busy) return
    setBusy(true)
    setError('')
    try {
      const { error: authError } = await client.auth.signOut()
      if (authError) throw authError
      onAuthChange(null)
      setStep('details')
    } catch (authError) {
      setError(authError.message || 'Could not sign out. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  const resetToDetails = () => {
    setStep('details')
    setOtp('')
    setError('')
    setNotice('')
  }

  return (
    <main className="login-page">
      <section className="login-shell" aria-label="Orvixa account">
        <div className="login-brand-panel">
          <div className="login-brand-orbit login-brand-orbit-one" aria-hidden="true" />
          <div className="login-brand-orbit login-brand-orbit-two" aria-hidden="true" />
          <div className="login-brand-content">
            <a className="login-brand-mark" href="/" aria-label="Orvixa home">
              <img src={logo} alt="" />
            </a>
            <p className="login-brand-kicker">YOUR WORLD, BEAUTIFULLY CONNECTED</p>
            <h1>Everything you love, all in one place.</h1>
            <p className="login-brand-description">Sign in to make every Orvixa visit feel like yours.</p>
            <div className="login-brand-perks">
              <span><i aria-hidden="true">✦</i> A smoother way to shop</span>
              <span><i aria-hidden="true">✦</i> Your account, secured with a one-time code</span>
              <span><i aria-hidden="true">✦</i> No password to remember</span>
            </div>
          </div>
          <span className="login-brand-footer">ORVIXA <b>·</b> EVERYTHING. ONE PLACE.</span>
        </div>

        <div className="login-form-panel">
          {isLoading ? (
            <section className="login-account-card" role="status" aria-live="polite">
              <span className="login-spinner login-loading-spinner" aria-hidden="true" />
              <p className="login-eyebrow">WELCOME BACK</p>
              <h2>Checking your account…</h2>
            </section>
          ) : user ? (
            <section className="login-account-card" aria-live="polite">
              <span className="login-success-mark" aria-hidden="true">✓</span>
              <p className="login-eyebrow">YOUR ORVIXA ACCOUNT</p>
              <h2>You’re signed in.</h2>
              <p className="login-account-identity">{user.email || user.phone}</p>
              <p className="login-account-copy">Your verified account is ready for your next visit.</p>
              {error && <p className="login-error" role="alert">{error}</p>}
              <button className="login-primary-button" type="button" onClick={signOut} disabled={busy}>
                {busy ? 'Signing out…' : 'Sign out'}
              </button>
              <a className="login-home-link" href="/">Continue shopping <span aria-hidden="true">→</span></a>
            </section>
          ) : step === 'success' ? (
            <section className="login-account-card" aria-live="polite">
              <span className="login-success-mark" aria-hidden="true">✓</span>
              <p className="login-eyebrow">VERIFIED & SECURE</p>
              <h2>You’re all set.</h2>
              <p className="login-account-identity">{destination}</p>
              <p className="login-account-copy">Your Orvixa account is ready. You can now continue shopping.</p>
              <a className="login-primary-button login-primary-link" href="/">Continue to Orvixa</a>
            </section>
          ) : (
            <>
              <p className="login-eyebrow">{step === 'otp' ? 'ONE LAST STEP' : 'WELCOME TO ORVIXA'}</p>
              <h2>{step === 'otp' ? 'Check your inbox' : mode === 'login' ? 'Welcome back' : 'Create your account'}</h2>
              <p className="login-intro">
                {step === 'otp'
                  ? `Enter the 6-digit code we sent to ${destination}.`
                  : mode === 'login'
                    ? 'Sign in with a one-time code. No password needed.'
                    : 'Join Orvixa with a quick, password-free sign up.'}
              </p>

              {!isConfigured && (
                <div className="login-setup-notice" role="status">
                  <strong>Supabase authentication needs setup</strong>
                  <span>Add your Supabase project URL and anon key to <code>.env</code>, then restart Vite. Enable email or phone OTP in the Supabase dashboard.</span>
                </div>
              )}

              {step === 'details' ? (
                <form className="login-form" onSubmit={sendOtp}>
                  <div className="login-mode-tabs" role="tablist" aria-label="Account action">
                    <button type="button" role="tab" aria-selected={mode === 'login'} className={mode === 'login' ? 'is-active' : ''} onClick={() => { setMode('login'); setError('') }}>Sign in</button>
                    <button type="button" role="tab" aria-selected={mode === 'register'} className={mode === 'register' ? 'is-active' : ''} onClick={() => { setMode('register'); setError('') }}>Create account</button>
                  </div>

                  <div className="login-method-tabs" role="tablist" aria-label="Choose sign-in method">
                    <button type="button" role="tab" aria-selected={method === 'email'} className={method === 'email' ? 'is-active' : ''} onClick={() => { setMethod('email'); setError('') }}>
                      <span aria-hidden="true">✉</span> Email
                    </button>
                    <button type="button" role="tab" aria-selected={method === 'phone'} className={method === 'phone' ? 'is-active' : ''} onClick={() => { setMethod('phone'); setError('') }}>
                      <span aria-hidden="true">⌕</span> Phone
                    </button>
                  </div>

                  {mode === 'register' && (
                    <label className="login-field">
                      Your name
                      <input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" maxLength="80" placeholder="How should we greet you?" required />
                    </label>
                  )}

                  {method === 'email' ? (
                    <label className="login-field">
                      Email address
                      <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" maxLength="120" placeholder="you@example.com" required />
                    </label>
                  ) : (
                    <label className="login-field">
                      Mobile number
                      <span className="login-phone-input">
                        <span aria-hidden="true">🇮🇳 +91</span>
                        <input type="tel" value={phone} onChange={(event) => setPhone(event.target.value.replace(/\D/g, '').slice(0, 10))} autoComplete="tel-national" inputMode="numeric" pattern="[6-9][0-9]{9}" maxLength="10" placeholder="10-digit number" required />
                      </span>
                    </label>
                  )}

                  {error && <p className="login-error" role="alert">{error}</p>}
                  <button className="login-primary-button" type="submit" disabled={!isConfigured || busy}>
                    {busy ? <><span className="login-spinner" aria-hidden="true" /> Sending code…</> : 'Send one-time code'}
                    {!busy && <span aria-hidden="true">→</span>}
                  </button>
                  <p className="login-terms">By continuing, you agree to Orvixa’s <a href="/pages/terms-conditions">Terms</a> and <a href="/pages/privacy-policy">Privacy Policy</a>.</p>
                </form>
              ) : (
                <form className="login-form login-otp-form" onSubmit={verifyOtp}>
                  <div className="login-otp-destination">
                    <span className="login-destination-icon" aria-hidden="true">{method === 'email' ? '✉' : '⌕'}</span>
                    <div><span>Code sent to</span><strong>{destination}</strong></div>
                    <button type="button" onClick={resetToDetails}>Change</button>
                  </div>
                  <label className="login-field login-otp-label">
                    <span>6-digit verification code</span>
                    <input
                      ref={otpInput}
                      className="login-otp-input"
                      type="text"
                      value={otp}
                      onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, OTP_LENGTH))}
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      pattern="[0-9]{6}"
                      maxLength={OTP_LENGTH}
                      placeholder="······"
                      aria-label="6-digit verification code"
                      required
                    />
                  </label>
                  {notice && <p className="login-notice" role="status">{notice}</p>}
                  {error && <p className="login-error" role="alert">{error}</p>}
                  <button className="login-primary-button" type="submit" disabled={!isConfigured || busy || otp.length !== OTP_LENGTH}>
                    {busy ? <><span className="login-spinner" aria-hidden="true" /> Verifying…</> : 'Verify & sign in'}
                    {!busy && <span aria-hidden="true">→</span>}
                  </button>
                  <div className="login-resend">
                    <span>Didn’t get a code?</span>
                    <button type="button" onClick={resendOtp} disabled={busy || secondsLeft > 0}>
                      {secondsLeft > 0 ? `Resend in ${secondsLeft}s` : 'Resend code'}
                    </button>
                  </div>
                  <p className="login-otp-security"><span aria-hidden="true">♢</span> Your one-time code is private. Never share it with anyone.</p>
                </form>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  )
}
