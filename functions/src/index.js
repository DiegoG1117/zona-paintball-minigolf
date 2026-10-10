import { initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getMessaging } from 'firebase-admin/messaging'
import { onDocumentWritten } from 'firebase-functions/v2/firestore'

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
