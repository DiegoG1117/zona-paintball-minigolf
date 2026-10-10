import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
} from 'firebase/firestore'
import { getDb } from '../firebase/config.js'
import {
  ACTIVE_MATCH_KEY,
  COURSE_ID,
  HOLE_COUNT,
  JOIN_CODE_LENGTH,
} from '../game/constants.js'
import { computeTotalFromHoles } from '../game/computeLocalResults.js'
import { resolveAvatarId } from '../avatars/catalog.jsx'

function randomJoinCode() {
  const max = 10 ** JOIN_CODE_LENGTH
  const n = Math.floor(Math.random() * max)
  return String(n).padStart(JOIN_CODE_LENGTH, '0')
}

export function persistActiveMatchId(matchId) {
  try {
    if (matchId) localStorage.setItem(ACTIVE_MATCH_KEY, matchId)
    else localStorage.removeItem(ACTIVE_MATCH_KEY)
  } catch {
    // ignore
  }
}

export function readActiveMatchId() {
  try {
    return localStorage.getItem(ACTIVE_MATCH_KEY)
  } catch {
    return null
  }
}

function playerPayload(profile, isHost) {
  return {
    username: profile?.username || '',
    displayName: profile?.displayName || profile?.username || 'Jugador',
    photoURL: resolveAvatarId(profile),
    avatarId: resolveAvatarId(profile),
    isHost: Boolean(isHost),
    joinedAt: serverTimestamp(),
  }
}

export async function createMatch(uid, profile) {
  const db = getDb()
  if (!db) throw new Error('Firebase no está configurado')

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const joinCode = randomJoinCode()
    const matchRef = doc(collection(db, 'matches'))
    const codeRef = doc(db, 'joinCodes', joinCode)
    try {
      await runTransaction(db, async (tx) => {
        const existing = await tx.get(codeRef)
        if (existing.exists()) throw new Error('CODE_TAKEN')
        tx.set(matchRef, {
          hostId: uid,
          joinCode,
          status: 'lobby',
          mode: null,
          playerIds: [uid],
          courseId: COURSE_ID,
          holes: HOLE_COUNT,
          createdAt: serverTimestamp(),
          startedAt: null,
          finishedAt: null,
        })
        tx.set(doc(db, 'matches', matchRef.id, 'players', uid), playerPayload(profile, true))
        tx.set(doc(db, 'matches', matchRef.id, 'scores', uid), {
          holes: {},
          total: 0,
          updatedAt: serverTimestamp(),
        })
        tx.set(codeRef, { matchId: matchRef.id, hostId: uid })
      })
      persistActiveMatchId(matchRef.id)
      return { matchId: matchRef.id, joinCode }
    } catch (err) {
      if (err?.message === 'CODE_TAKEN') continue
      throw err
    }
  }
  throw new Error('No se pudo generar un código. Inténtalo de nuevo.')
}

export async function joinMatch(uid, profile, code) {
  const db = getDb()
  if (!db) throw new Error('Firebase no está configurado')
  const joinCode = String(code || '').replace(/\D/g, '').padStart(JOIN_CODE_LENGTH, '0').slice(-JOIN_CODE_LENGTH)
  const codeRef = doc(db, 'joinCodes', joinCode)

  const matchId = await runTransaction(db, async (tx) => {
    const codeSnap = await tx.get(codeRef)
    if (!codeSnap.exists()) throw new Error('Código inválido o partida cerrada')
    const id = codeSnap.data().matchId
    const matchRef = doc(db, 'matches', id)
    const matchSnap = await tx.get(matchRef)
    if (!matchSnap.exists()) throw new Error('La partida ya no existe')
    const match = matchSnap.data()
    if (match.status !== 'lobby') throw new Error('Esta partida ya no admite jugadores')
    const playerIds = Array.isArray(match.playerIds) ? match.playerIds : []
    if (!playerIds.includes(uid)) {
      tx.update(matchRef, { playerIds: [...playerIds, uid] })
      tx.set(doc(db, 'matches', id, 'players', uid), playerPayload(profile, false))
      tx.set(doc(db, 'matches', id, 'scores', uid), {
        holes: {},
        total: 0,
        updatedAt: serverTimestamp(),
      })
    }
    return id
  })
  persistActiveMatchId(matchId)
  return matchId
}

export async function getMatch(matchId) {
  const db = getDb()
  if (!db || !matchId) return null
  const snap = await getDoc(doc(db, 'matches', matchId))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export async function getMatchPlayers(matchId) {
  const db = getDb()
  if (!db || !matchId) return []
  const snap = await getDocs(collection(db, 'matches', matchId, 'players'))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function getMatchScores(matchId) {
  const db = getDb()
  if (!db || !matchId) return {}
  const snap = await getDocs(collection(db, 'matches', matchId, 'scores'))
  const scores = {}
  snap.docs.forEach((d) => {
    scores[d.id] = d.data()
  })
  return scores
}

export function listenMatch(matchId, onNext, onError) {
  const db = getDb()
  if (!db || !matchId) return () => {}
  return onSnapshot(
    doc(db, 'matches', matchId),
    (snap) => onNext(snap.exists() ? { id: snap.id, ...snap.data() } : null),
    onError
  )
}

export function listenMatchPlayers(matchId, onNext, onError) {
  const db = getDb()
  if (!db || !matchId) return () => {}
  return onSnapshot(
    collection(db, 'matches', matchId, 'players'),
    (snap) => onNext(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    onError
  )
}

export async function startMatch(matchId, mode) {
  const db = getDb()
  if (!db) throw new Error('Firebase no está configurado')
  await updateDoc(doc(db, 'matches', matchId), {
    status: 'playing',
    mode,
    startedAt: serverTimestamp(),
  })
}

export async function writePlayerScore(matchId, uid, holes) {
  const db = getDb()
  if (!db) throw new Error('Firebase no está configurado')
  const total = computeTotalFromHoles(holes)
  await setDoc(
    doc(db, 'matches', matchId, 'scores', uid),
    { holes, total, updatedAt: serverTimestamp() },
    { merge: true }
  )
  return total
}

export async function finishMatchInFirestore(matchId, joinCode) {
  const db = getDb()
  if (!db) throw new Error('Firebase no está configurado')
  const batch = writeBatch(db)
  batch.update(doc(db, 'matches', matchId), {
    status: 'finished',
    finishedAt: serverTimestamp(),
  })
  if (joinCode) batch.delete(doc(db, 'joinCodes', joinCode))
  await batch.commit()
}

export async function abandonMatchInFirestore(matchId, joinCode) {
  const db = getDb()
  if (!db) throw new Error('Firebase no está configurado')
  const batch = writeBatch(db)
  batch.update(doc(db, 'matches', matchId), {
    status: 'abandoned',
    abandonedAt: serverTimestamp(),
  })
  if (joinCode) batch.delete(doc(db, 'joinCodes', joinCode))
  await batch.commit()
}

export async function deleteJoinCode(joinCode) {
  const db = getDb()
  if (!db || !joinCode) return
  try {
    await deleteDoc(doc(db, 'joinCodes', joinCode))
  } catch {
    // ignore
  }
}
