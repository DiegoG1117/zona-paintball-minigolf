import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { getFirebaseAuth } from './config.js'

export function subscribeAuth(callback) {
  const auth = getFirebaseAuth()
  if (!auth) {
    callback(null)
    return () => {}
  }
  return onAuthStateChanged(auth, callback)
}

export function registerWithEmail(email, password) {
  const auth = getFirebaseAuth()
  if (!auth) throw new Error('Firebase no está configurado')
  return createUserWithEmailAndPassword(auth, email, password)
}

export function loginWithEmail(email, password) {
  const auth = getFirebaseAuth()
  if (!auth) throw new Error('Firebase no está configurado')
  return signInWithEmailAndPassword(auth, email, password)
}

export function logout() {
  const auth = getFirebaseAuth()
  if (!auth) return Promise.resolve()
  return signOut(auth)
}

export function sendResetEmail(email) {
  const auth = getFirebaseAuth()
  if (!auth) throw new Error('Firebase no está configurado')
  return sendPasswordResetEmail(auth, email)
}

export function getCurrentUser() {
  return getFirebaseAuth()?.currentUser ?? null
}
