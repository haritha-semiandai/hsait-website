import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Loader2, ShieldCheck } from 'lucide-react'

function AdminLogin() {
  const navigate = useNavigate()
  const { signInWithEmail } = useAuth()
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const onChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      // Use standard email sign in
      await signInWithEmail(formData.username, formData.password)
      navigate('/admin', { replace: true })
    } catch (err) {
      setError('Invalid admin credentials. Please ensure you are using the authorized admin account.')
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="section-shell pb-20 pt-10">
      <section className="mx-auto max-w-md">
        <div className="surface-card shadow-2xl">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <ShieldCheck size={32} />
            </div>
            <h1 className="text-2xl font-bold dark:text-white">Admin Portal</h1>
            <p className="mt-2 text-sm text-ink/70 dark:text-gray-400">
              Sign in with your admin credentials to manage the platform.
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold dark:text-gray-200" htmlFor="username">
                Admin Email
              </label>
              <input
                id="username"
                name="username"
                type="email"
                value={formData.username}
                onChange={onChange}
                className="input-clean"
                placeholder="harithasemiconductorsandaitech@gmail.com"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold dark:text-gray-200" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={onChange}
                className="input-clean"
                placeholder="Enter password"
                required
              />
            </div>

            {error && (
              <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-300">
                {error}
              </p>
            )}

            <button 
              type="submit" 
              className="btn btn-primary w-full py-4 text-base shadow-lg transition-transform active:scale-[0.98]"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 animate-spin" size={20} />
                  Verifying...
                </>
              ) : (
                <>
                  <ShieldCheck size={18} className="mr-2" />
                  Sign In to Dashboard
                </>
              )}
            </button>
          </form>
          
          <p className="mt-8 text-center text-xs text-ink/40 dark:text-gray-500 font-medium">
            Authorized: harithasemiconductorsandaitech@gmail.com
          </p>
        </div>
      </section>
    </div>
  )
}

export default AdminLogin
