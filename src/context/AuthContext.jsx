import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '../lib/firebase'
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
    let unsubscribeProfile = null
    const unsubscribeAuth = subscribeToAuthState((nextUser) => {
      if (nextUser) {
        if (unsubscribeProfile) unsubscribeProfile()

        if (db) {
          unsubscribeProfile = onSnapshot(doc(db, 'users', nextUser.uid), (docSnap) => {
            const profileData = docSnap.exists() ? docSnap.data() : {}
            setUser({
              ...nextUser,
              ...profileData,
            })
            setIsAuthLoading(false)
          }, (error) => {
            console.error('Error listening to user profile changes:', error)
            setUser(nextUser)
            setIsAuthLoading(false)
          })
        } else {
          setUser(nextUser)
          setIsAuthLoading(false)
        }
      } else {
        if (unsubscribeProfile) {
          unsubscribeProfile()
          unsubscribeProfile = null
        }
        setUser(null)
        setIsAuthLoading(false)
      }
    })

    return () => {
      unsubscribeAuth()
      if (unsubscribeProfile) unsubscribeProfile()
    }
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
