import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  where,
  writeBatch,
} from 'firebase/firestore'
import { getDb } from '../firebase/config.js'
import { BEST_FIELDS, COURSE_ID, HOLE_COUNT, HISTORY_PAGE_SIZE, TOTAL_FIELDS } from '../game/constants.js'

function isBetterScore(mode, candidate, currentBest) {
  if (candidate == null || !Number.isFinite(Number(candidate))) return false
  if (currentBest == null || !Number.isFinite(Number(currentBest))) return true
  return Number(candidate) < Number(currentBest)
}

export async function saveMyFinishedGame({ match, uid, profile, score }) {
  const db = getDb()
  if (!db) throw new Error('Firebase no está configurado')
  if (!match?.id || !uid) throw new Error('Partida inválida')
  const numericScore = Number(score)
  if (!Number.isFinite(numericScore)) throw new Error('Puntuación inválida')

  const mode = match.mode || 'classic'
  const bestField = BEST_FIELDS[mode]
  const totalField = TOTAL_FIELDS[mode]
  const userRef = doc(db, 'users', uid)
  const gameRef = doc(db, 'games', `${match.id}_${uid}`)
  const existingGame = await getDoc(gameRef)
  if (existingGame.exists()) {
    return { record: false, gameId: gameRef.id, score: numericScore, alreadySaved: true }
  }
  const userSnap = await getDoc(userRef)
  const current = userSnap.exists() ? userSnap.data() : {}
  const currentBest = current[bestField]
  const record = isBetterScore(mode, numericScore, currentBest)

  const batch = writeBatch(db)
  batch.set(gameRef, {
    matchId: match.id,
    userId: uid,
    username: profile?.username || current.username || '',
    mode,
    score: numericScore,
    holes: match.holes || HOLE_COUNT,
    courseId: match.courseId || COURSE_ID,
    createdAt: serverTimestamp(),
  })
  const userPatch = {
    [totalField]: Number(current[totalField] || 0) + 1,
  }
  if (record) userPatch[bestField] = numericScore
  if (userSnap.exists()) batch.update(userRef, userPatch)
  await batch.commit()
  return { record, gameId: gameRef.id, score: numericScore }
}

function createdAtMillis(value) {
  if (!value) return 0
  if (typeof value.toMillis === 'function') return value.toMillis()
  if (typeof value.seconds === 'number') return value.seconds * 1000
  return 0
}

export async function listUserGames(uid, { pageSize = HISTORY_PAGE_SIZE, cursor = 0 } = {}) {
  const db = getDb()
  if (!db || !uid) return { games: [], cursor: null }
  // Equality on userId uses the automatic index. orderBy(createdAt) needs a
  // composite index that is not deployed, so the history query was failing.
  const snap = await getDocs(query(collection(db, 'games'), where('userId', '==', uid)))
  const games = snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .sort((a, b) => createdAtMillis(b.createdAt) - createdAtMillis(a.createdAt))
  const offset = Number(cursor) || 0
  const page = games.slice(offset, offset + pageSize)
  const next = offset + pageSize
  return { games: page, cursor: next < games.length ? next : null }
}
