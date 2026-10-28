import { getApps, initializeApp } from 'firebase/app'
import { getAuth, signInWithCustomToken } from 'firebase/auth'
import { collection, getFirestore, onSnapshot, orderBy, query } from 'firebase/firestore'
import { getFirebaseWebConfig, isFirebaseConfigured } from '../firebase/config.js'

const INBOX_APP = 'whatsappInbox'

function inboxApp() {
  const existing = getApps().find((app) => app.name === INBOX_APP)
  if (existing) return existing
  return initializeApp(getFirebaseWebConfig(), INBOX_APP)
}

export function inboxConfigured() {
  return isFirebaseConfigured
}

export async function openWhatsappInbox(clave) {
  if (!isFirebaseConfigured) {
    throw Object.assign(new Error('config'), { code: 'config' })
  }
  const projectId = getFirebaseWebConfig().projectId
  const response = await fetch(
    `https://us-central1-${projectId}.cloudfunctions.net/whatsappChatAccess`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clave }),
    },
  )
  if (response.status === 401 || response.status === 403) {
    throw Object.assign(new Error('clave'), { code: 'clave' })
  }
  if (!response.ok) {
    throw Object.assign(new Error('access'), { code: 'access' })
  }
  const payload = await response.json()
  if (!payload?.token) {
    throw Object.assign(new Error('access'), { code: 'access' })
  }
  const app = inboxApp()
  await signInWithCustomToken(getAuth(app), payload.token)
  return getFirestore(app)
}

export function listenWhatsappChats(db, onData, onError) {
  const chatsQuery = query(collection(db, 'whatsappChats'), orderBy('lastAt', 'desc'))
  return onSnapshot(chatsQuery, (snap) => {
    onData(snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() })))
  }, onError)
}

export function listenWhatsappMessages(db, phone, onData, onError) {
  const messagesQuery = query(
    collection(db, 'whatsappChats', phone, 'messages'),
    orderBy('at', 'asc'),
  )
  return onSnapshot(messagesQuery, (snap) => {
    onData(snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() })))
  }, onError)
}
