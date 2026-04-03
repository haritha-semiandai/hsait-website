import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  adminSignIn,
  requestPasswordReset,
  resendVerificationForCredentials,
  signInWithEmail,
  signOutUser,
  signUpWithEmail,
  subscribeToAuthState,
} from '../services/authService'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isAuthLoading, setIsAuthLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = subscribeToAuthState((nextUser) => {
      setUser(nextUser)
      setIsAuthLoading(false)
    })

    return unsubscribe
  }, [])

  const value = useMemo(
    () => ({
      user,
      isAuthLoading,
      signInWithEmail,
      adminSignIn,
      signUpWithEmail,
      requestPasswordReset,
      resendVerificationForCredentials,
      signOutUser,
    }),
    [user, isAuthLoading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }

  return context
}
