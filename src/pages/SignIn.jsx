import { Loader2, LogIn, Eye, EyeOff } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function SignIn() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const {
    user,
    isAuthLoading,
    signInWithEmail,
    signUpWithEmail,
    requestPasswordReset,
    resendVerificationForCredentials,
  } = useAuth()
  const redirectPath = searchParams.get('redirect')
  const safeRedirectPath = redirectPath?.startsWith('/') ? redirectPath : '/profile'

  const [mode, setMode] = useState(searchParams.get('mode') === 'signup' ? 'signup' : 'signin')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  })
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const heading = useMemo(
    () => (mode === 'signin' ? 'Sign in to your account' : 'Create your account'),
    [mode],
  )

  if (!isAuthLoading && user) {
    return <Navigate to={safeRedirectPath} replace />
  }

  const onChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const onSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')
    setIsSubmitting(true)

    try {
      if (mode === 'signin') {
        await signInWithEmail(formData.email, formData.password)
        navigate(safeRedirectPath, { replace: true })
      } else {
        if (!hasAcceptedTerms) {
          throw new Error('Please accept the Terms & Conditions and Privacy Policy to continue.')
        }
        await signUpWithEmail(formData.email, formData.password, formData.name)
        setSuccess('Account created. We sent a verification link to your email. Verify your email before signing in.')
        setMode('signin')
      }
    } catch (err) {
      setError(err?.message ?? 'Unable to complete authentication. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleForgotPassword = async () => {
    setError('')
    setSuccess('')

    if (!formData.email) {
      setError('Enter your email first, then click Forgot password.')
      return
    }

    try {
      await requestPasswordReset(formData.email)
      setSuccess('Password reset email sent. Please check your inbox.')
    } catch (err) {
      setError(err?.message ?? 'Unable to send password reset email right now.')
    }
  }

  const handleResendVerification = async () => {
    setError('')
    setSuccess('')

    try {
      await resendVerificationForCredentials(formData.email, formData.password)
      setSuccess('Verification email sent again. Please check your inbox.')
    } catch (err) {
      setError(err?.message ?? 'Unable to resend verification email.')
    }
  }

  return (
    <div className="section-shell pb-12">
      <section className="mx-auto max-w-xl">
        <div className="hero-panel">
          <p className="section-kicker">Account</p>
          <h1 className="mt-4 text-3xl font-semibold dark:text-gray-100">{heading}</h1>
          <p className="mt-3 text-ink/70 dark:text-gray-300">
            Secure access powered by Firebase Authentication.
          </p>

          <div className="mt-8 grid grid-cols-2 rounded-xl border border-slate-200 p-1 dark:border-gray-700">
            <button
              type="button"
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                mode === 'signin'
                  ? 'bg-primary text-white'
                  : 'text-ink/70 hover:bg-slate-100 dark:text-gray-300 dark:hover:bg-gray-800'
              }`}
              onClick={() => setMode('signin')}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                mode === 'signup'
                  ? 'bg-primary text-white'
                  : 'text-ink/70 hover:bg-slate-100 dark:text-gray-300 dark:hover:bg-gray-800'
              }`}
              onClick={() => setMode('signup')}
            >
              Sign Up
            </button>
          </div>

          <form className="mt-6 space-y-4" onSubmit={onSubmit}>
            {mode === 'signup' && (
              <div>
                <label className="mb-2 block text-sm font-medium text-ink dark:text-gray-200" htmlFor="name">
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={onChange}
                  className="input-clean"
                  placeholder="Enter your full name"
                  required
                />
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-medium text-ink dark:text-gray-200" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="text"
                value={formData.email}
                onChange={onChange}
                className="input-clean"
                placeholder="you@example.com or username"
                required
              />
            </div>

            <div className="relative">
              <label className="mb-2 block text-sm font-medium text-ink dark:text-gray-200" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                minLength={6}
                value={formData.password}
                onChange={onChange}
                className="input-clean pr-12"
                placeholder="Minimum 6 characters"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[38px] text-ink/40 transition hover:text-primary dark:text-gray-500 dark:hover:text-sky-400"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>

              {mode === 'signin' && (
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="mt-2 text-sm font-semibold text-primary hover:text-accent dark:text-sky-400 dark:hover:text-sky-300"
                >
                  Forgot password?
                </button>
              )}
            </div>

            {mode === 'signup' && (
              <label className="flex items-start gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm text-ink/80 dark:border-gray-700 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={hasAcceptedTerms}
                  onChange={(event) => setHasAcceptedTerms(event.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary dark:border-gray-600"
                  required
                />
                <span>
                  I agree to the{' '}
                  <Link
                    to="/terms"
                    className="font-semibold text-primary hover:text-accent dark:text-sky-400 dark:hover:text-sky-300"
                  >
                    Terms & Conditions
                  </Link>{' '}
                  and{' '}
                  <Link
                    to="/privacy"
                    className="font-semibold text-primary hover:text-accent dark:text-sky-400 dark:hover:text-sky-300"
                  >
                    Privacy Policy
                  </Link>
                  .
                </span>
              </label>
            )}

            {error && (
              <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/70 dark:bg-red-950/30 dark:text-red-300">
                {error}
              </p>
            )}

            {success && (
              <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/70 dark:bg-emerald-950/30 dark:text-emerald-300">
                {success}
              </p>
            )}

            <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <LogIn size={18} className="mr-2" />
                  {mode === 'signin' ? 'Sign In' : 'Create Account'}
                </>
              )}
            </button>

            {mode === 'signin' && (
              <button
                type="button"
                className="btn-secondary w-full"
                onClick={handleResendVerification}
              >
                Resend Verification Email
              </button>
            )}

          </form>

        </div>
      </section>
    </div>
  )
}

export default SignIn
