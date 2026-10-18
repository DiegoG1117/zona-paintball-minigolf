import { collection, getDocs, limit, orderBy, query, startAfter } from 'firebase/firestore'
import { getDb } from '../firebase/config.js'
import { BEST_FIELDS, RANKING_PAGE_SIZE } from '../game/constants.js'

const cache = {
  byMode: {},
}

export function getCachedRanking(mode) {
  return cache.byMode[mode] || null
}

export function setCachedRanking(mode, entry) {
  cache.byMode[mode] = entry
}

function mapRankingDoc(docSnap, field) {
  const data = docSnap.data()
  return {
    id: docSnap.id,
    username: data.username || '',
    displayName: data.displayName || data.username || '',
    photoURL: data.photoURL || '',
    avatarId: data.avatarId || '',
    score: data[field],
  }
}

export async function fetchRankingPage(mode, { pageSize = RANKING_PAGE_SIZE, cursor = null } = {}) {
  const db = getDb()
  const field = BEST_FIELDS[mode]
  if (!db || !field) return { rows: [], cursor: null }
  const constraints = [orderBy(field), limit(pageSize)]
  if (cursor) constraints.push(startAfter(cursor))
  const snap = await getDocs(query(collection(db, 'users'), ...constraints))
  const rows = snap.docs
    .map((docSnap) => mapRankingDoc(docSnap, field))
    .filter((row) => row.score != null && Number.isFinite(Number(row.score)))
  const nextCursor = snap.docs.length === pageSize ? snap.docs[snap.docs.length - 1] : null
  return { rows, cursor: nextCursor }
}
