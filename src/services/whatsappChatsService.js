import { collection, doc, onSnapshot, orderBy, query, updateDoc } from 'firebase/firestore'
import { getDb, isFirebaseConfigured } from '../firebase/config.js'

const SEND_URL = 'https://n8n.zpminigolf.com/webhook/whatsapp-enviar-desde-bandeja'
const SUMMARY_URL = 'https://n8n.zpminigolf.com/webhook/whatsapp-resumen-bandeja'

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

export async function requestWhatsappSummary(phone, messages) {
  const to = String(phone || '').replace(/\D/g, '')
  const mensajes = (messages || [])
    .map((message) => ({
      quien: message.direction === 'in' ? 'cliente' : 'parque',
      texto: String(message.text || '').replace(/\s+/g, ' ').trim().slice(0, 400),
    }))
    .filter((item) => item.texto)
    .slice(-40)
  const response = await fetch(SUMMARY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to, mensajes }),
  })
  let payload = null
  try {
    payload = await response.json()
  } catch {
    payload = null
  }
  const resumen = String(payload?.resumen || '').trim().slice(0, 1200)
  if (!response.ok || payload?.ok === false || !resumen) {
    throw new Error(payload?.error || 'No se pudo generar el resumen.')
  }
  return resumen
}

export async function saveWhatsappSummary(db, chatId, resumen) {
  const text = String(resumen || '').trim().slice(0, 1200)
  if (!db || !chatId || !text) throw new Error('No se pudo guardar el resumen.')
  await updateDoc(doc(db, 'whatsappChats', chatId), { resumen: text })
}
