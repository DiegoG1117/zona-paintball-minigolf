import { createHash, timingSafeEqual } from 'node:crypto'
import { initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { FieldValue, getFirestore, Timestamp } from 'firebase-admin/firestore'
import { getMessaging } from 'firebase-admin/messaging'
import { onRequest } from 'firebase-functions/v2/https'
import { onDocumentWritten } from 'firebase-functions/v2/firestore'
import { defineSecret } from 'firebase-functions/params'

const ingestSecret = defineSecret('WHATSAPP_CHAT_INGEST_SECRET')
const viewKey = defineSecret('WHATSAPP_CHAT_VIEW_KEY')
const BOT_NAME = 'Zona Paintball'

initializeApp()

async function tokensForPlayers(playerIds = [], exceptUid) {
  const db = getFirestore()
  const ids = playerIds.filter((id) => id && id !== exceptUid)
  const tokens = []
  await Promise.all(ids.map(async (uid) => {
    const snap = await db.doc(`fcmTokens/${uid}`).get()
    const list = snap.data()?.tokens
    if (Array.isArray(list)) tokens.push(...list.filter(Boolean))
  }))
  return [...new Set(tokens)]
}

async function notifyMatch(matchId, type, exceptUid) {
  const db = getFirestore()
  const matchSnap = await db.doc(`matches/${matchId}`).get()
  if (!matchSnap.exists) return
  const tokens = await tokensForPlayers(matchSnap.data().playerIds, exceptUid)
  if (tokens.length === 0) return
  await getMessaging().sendEachForMulticast({
    tokens,
    data: { type, matchId },
  })
}

export const notifyMatchScore = onDocumentWritten(
  'matches/{matchId}/scores/{uid}',
  async (event) => {
    const matchId = event.params.matchId
    const uid = event.params.uid
    const matchSnap = await getFirestore().doc(`matches/${matchId}`).get()
    if (matchSnap.data()?.status !== 'playing') return
    await notifyMatch(matchId, 'scoreUpdated', uid)
  }
)

function sameSecret(given, expected) {
  if (!expected || !given) return false
  const left = createHash('sha256').update(String(given)).digest()
  const right = createHash('sha256').update(String(expected)).digest()
  return timingSafeEqual(left, right)
}

function phoneId(raw) {
  const digits = String(raw || '').replace(/\D/g, '')
  if (digits.length < 8 || digits.length > 15) return null
  return digits
}

function messageDocId(raw) {
  const id = String(raw || '').trim().replace(/[/\s#?[\]*]/g, '_')
  if (!id || id.length > 700 || id === '.' || id === '..') return null
  return id
}

function cleanText(raw, max) {
  return String(raw || '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, max)
}

function messageTime(raw) {
  if (raw == null || raw === '') return Timestamp.now()
  if (typeof raw === 'number' || /^\d+$/.test(String(raw))) {
    const numeric = Number(raw)
    const millis = numeric < 1e12 ? numeric * 1000 : numeric
    const fromNumber = new Date(millis)
    if (!Number.isNaN(fromNumber.getTime())) return Timestamp.fromDate(fromNumber)
  }
  const parsed = new Date(raw)
  if (!Number.isNaN(parsed.getTime())) return Timestamp.fromDate(parsed)
  return Timestamp.now()
}

export const whatsappChatIngest = onRequest(
  {
    region: 'us-central1',
    cors: false,
    invoker: 'public',
    secrets: [ingestSecret],
    timeoutSeconds: 20,
    memory: '256MiB',
  },
  async (req, res) => {
    if (req.method !== 'POST') {
      res.status(405).json({ ok: false })
      return
    }
    if (!sameSecret(req.get('x-whatsapp-chat-secret'), ingestSecret.value())) {
      res.status(401).json({ ok: false })
      return
    }

    const body = req.body || {}
    const phone = phoneId(body.phone)
    const direction = body.direction === 'in' || body.direction === 'out' ? body.direction : null
    const kind = body.kind === 'image' ? 'image' : 'text'
    const messageId = messageDocId(body.waMessageId)
    let text = cleanText(body.text, 8000)
    if (!text && kind === 'image') text = '[foto]'
    if (!phone || !direction || !messageId || !text) {
      res.status(400).json({ ok: false })
      return
    }

    const name = cleanText(body.name, 80)
    const senderName = direction === 'out'
      ? (cleanText(body.senderName, 80) || BOT_NAME)
      : (name || phone)
    const at = messageTime(body.at)

    try {
      const db = getFirestore()
      const sessionRef = db.collection('whatsappChats').doc(phone)
      const messageRef = sessionRef.collection('messages').doc(messageId)
      const duplicate = await db.runTransaction(async (tx) => {
        const existing = await tx.get(messageRef)
        if (existing.exists) return true
        const session = await tx.get(sessionRef)
        const previousAt = session.get('lastAt')
        const isNewer = !previousAt || at.toMillis() >= previousAt.toMillis()
        tx.set(messageRef, {
          direction,
          text,
          senderName,
          at,
          kind,
        })
        const patch = { phone, updatedAt: FieldValue.serverTimestamp() }
        if (!session.exists) patch.name = direction === 'in' && name ? name : (name || phone)
        else if (direction === 'in' && name) patch.name = name
        if (isNewer) {
          patch.lastText = text
          patch.lastAt = at
          patch.lastDirection = direction
        }
        tx.set(sessionRef, patch, { merge: true })
        return false
      })
      res.json({ ok: true, duplicate })
    } catch (error) {
      console.error('whatsappChatIngest', error?.message || error)
      res.status(500).json({ ok: false })
    }
  },
)

export const whatsappChatAccess = onRequest(
  {
    region: 'us-central1',
    cors: true,
    invoker: 'public',
    secrets: [viewKey],
    timeoutSeconds: 15,
    memory: '256MiB',
  },
  async (req, res) => {
    if (req.method !== 'POST') {
      res.status(405).json({ ok: false })
      return
    }
    if (!sameSecret(req.body?.clave, viewKey.value())) {
      res.status(401).json({ ok: false })
      return
    }
    try {
      const token = await getAuth().createCustomToken('whatsapp-inbox-reader', { inbox: true })
      res.json({ token })
    } catch (error) {
      console.error('whatsappChatAccess', error?.message || error)
      res.status(500).json({ ok: false })
    }
  },
)

export const notifyMatchFinished = onDocumentWritten(
  'matches/{matchId}',
  async (event) => {
    const before = event.data?.before?.data()
    const after = event.data?.after?.data()
    if (!after || after.status !== 'finished') return
    if (before?.status === 'finished') return
    await notifyMatch(event.params.matchId, 'matchFinished')
  }
)
