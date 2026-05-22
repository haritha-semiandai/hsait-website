import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ADMIN_CREDENTIALS = {
  email: 'hsait-admin',
  // Note: we check the email in the auth object, 
  // since firebase treats usernames as emails if configured so. 
  // If your admin user has a real email like admin@hsait.com, please update this.
}

function ProtectedRoute({ children, adminOnly = false }) {
  const location = useLocation()
  const { user, isAuthLoading } = useAuth()

  if (isAuthLoading) {
    return (
      <div className="section-shell pb-12">
        <div className="hero-panel mx-auto max-w-5xl py-14 text-center text-ink/70 dark:text-gray-300">
          Loading account...
        </div>
      </div>
    )
  }

  if (!user) {
    const redirect = `${location.pathname}${location.search}`
    const loginPath = adminOnly ? '/admin-login' : '/signin'
    return <Navigate to={`${loginPath}?redirect=${encodeURIComponent(redirect)}`} replace />
  }

  // Admin access check specifically for super-admin or instructor role
  const isSuperAdmin = user.email === 'harithasemiconductorsandaitech@gmail.com';
  const isInstructor = user.role === 'instructor';

  if (adminOnly && !isSuperAdmin && !isInstructor) {
    return <Navigate to="/" replace />
  }

  return children
}

export default ProtectedRoute
