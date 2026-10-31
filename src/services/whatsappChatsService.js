import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { getDb, isFirebaseConfigured } from '../firebase/config.js'

const SEND_URL = 'https://n8n.zpminigolf.com/webhook/whatsapp-enviar-desde-bandeja'

export function openWhatsappInbox() {
  if (!isFirebaseConfigured) return null
  return getDb()
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

export async function sendWhatsappReply(phone, text) {
  const to = String(phone || '').replace(/\D/g, '')
  const response = await fetch(SEND_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to, text: String(text || '').trim() }),
  })
  let payload = null
  try {
    payload = await response.json()
  } catch {
    payload = null
  }
  if (!response.ok || payload?.ok === false) {
    throw new Error(payload?.error || 'No se pudo enviar el mensaje.')
  }
  return payload
}
