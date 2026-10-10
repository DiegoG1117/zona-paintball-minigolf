import { getMessaging, getToken, isSupported, onMessage } from 'firebase/messaging'
import { getFirebaseApp, vapidKey } from './config.js'

let messagingPromise

async function getMessagingInstance() {
  if (!getFirebaseApp() || !vapidKey) return null
  if (typeof window === 'undefined') return null
  const supported = await isSupported().catch(() => false)
  if (!supported) return null
  if (!messagingPromise) {
    messagingPromise = Promise.resolve(getMessaging(getFirebaseApp()))
  }
  return messagingPromise
}

export async function registerFcmToken() {
  const messaging = await getMessagingInstance()
  if (!messaging || !('serviceWorker' in navigator) || !vapidKey) return null
  try {
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js')
    const token = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: registration,
    })
    return token || null
  } catch {
    return null
  }
}

export async function listenForegroundMessages(handler) {
  const messaging = await getMessagingInstance()
  if (!messaging) return () => {}
  return onMessage(messaging, handler)
}
