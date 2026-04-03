import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  reload,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
  signInWithEmailAndPassword,
  signOut,
  signInAnonymously,
} from 'firebase/auth'
import { auth, isFirebaseConfigured } from '../lib/firebase'
import { ensureUserProfileData } from './databaseService'

function getFirebaseConfigError() {
  return new Error('Firebase is not configured. Create a .env file from .env.example and add your Firebase keys.')
}

function ensureFirebaseReady() {
  if (!isFirebaseConfigured || !auth) {
    throw getFirebaseConfigError()
  }
}

async function saveUserProfile(user) {
  await ensureUserProfileData(user)
}

export async function signInWithEmail(email, password) {
  ensureFirebaseReady()
  const response = await signInWithEmailAndPassword(auth, email, password)
  await reload(response.user)

  if (!response.user.emailVerified) {
    await signOut(auth)
    const verificationError = new Error('Please verify your email before signing in. Check your inbox for the verification link.')
    verificationError.code = 'auth/email-not-verified'
    throw verificationError
  }

  await saveUserProfile(response.user)
  return response.user
}

export async function signUpWithEmail(email, password, displayName) {
  ensureFirebaseReady()
  const response = await createUserWithEmailAndPassword(auth, email, password)

  if (displayName?.trim()) {
    await updateProfile(response.user, { displayName: displayName.trim() })
  }

  await sendEmailVerification(response.user)
  await saveUserProfile(response.user)

  return response.user
}

export async function resendVerificationEmail() {
  ensureFirebaseReady()

  if (!auth.currentUser) {
    throw new Error('Sign in first to resend verification email.')
  }

  await sendEmailVerification(auth.currentUser)
}

export async function resendVerificationForCredentials(email, password) {
  ensureFirebaseReady()

  if (!email || !password) {
    throw new Error('Enter both email and password to resend verification email.')
  }

  const response = await signInWithEmailAndPassword(auth, email, password)
  await sendEmailVerification(response.user)
  await signOut(auth)
}

export function requestPasswordReset(email) {
  ensureFirebaseReady()
  return sendPasswordResetEmail(auth, email)
}

export function subscribeToAuthState(callback) {
  if (!isFirebaseConfigured || !auth) {
    callback(null)
    return () => {}
  }

  return onAuthStateChanged(auth, callback)
}

export function signOutUser() {
  ensureFirebaseReady()
  return signOut(auth)
}

export async function adminSignIn() {
  ensureFirebaseReady()
  // This uses Firebase Anonymous Login
  const response = await signInAnonymously(auth)
  return response.user
}
