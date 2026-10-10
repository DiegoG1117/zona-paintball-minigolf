import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId
)

export const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY || ''

let app
let auth
let db
let storage

export function getFirebaseApp() {
  if (!isFirebaseConfigured) return null
  if (!app) app = initializeApp(firebaseConfig)
  return app
}

export function getFirebaseAuth() {
  const instance = getFirebaseApp()
  if (!instance) return null
  if (!auth) auth = getAuth(instance)
  return auth
}

export function getDb() {
  const instance = getFirebaseApp()
  if (!instance) return null
  if (!db) db = getFirestore(instance)
  return db
}

export function getFirebaseStorage() {
  const instance = getFirebaseApp()
  if (!instance) return null
  if (!storage) storage = getStorage(instance)
  return storage
}

export function getFirebaseWebConfig() {
  return { ...firebaseConfig }
}
