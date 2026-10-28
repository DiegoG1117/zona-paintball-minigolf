import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { getDb, isFirebaseConfigured } from '../firebase/config.js'

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
