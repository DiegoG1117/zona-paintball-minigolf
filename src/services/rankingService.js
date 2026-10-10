import { collection, getDocs, limit, orderBy, query } from 'firebase/firestore'
import { getDb } from '../firebase/config.js'
import { BEST_FIELDS, MODES, RANKING_LIMIT } from '../game/constants.js'

const RANKING_MODES = [MODES.classic, MODES.runner, MODES.miniuno]

const cache = {
  data: null,
  inflight: null,
}

export function getCachedRankings() {
  return cache.data
}

export async function fetchRanking(mode, size = RANKING_LIMIT) {
  const db = getDb()
  const field = BEST_FIELDS[mode]
  if (!db || !field) return []
  const snap = await getDocs(
    query(collection(db, 'users'), orderBy(field), limit(size))
  )
  return snap.docs
    .map((d) => {
      const data = d.data()
      return {
        id: d.id,
        username: data.username,
        displayName: data.displayName || data.username,
        photoURL: data.photoURL || '',
        avatarId: data.avatarId || '',
        score: data[field],
      }
    })
    .filter((row) => row.score != null && Number.isFinite(Number(row.score)))
}

export async function fetchAllRankings(size = RANKING_LIMIT) {
  if (cache.inflight) return cache.inflight

  cache.inflight = Promise.all(
    RANKING_MODES.map((mode) => fetchRanking(mode, size).then((rows) => [mode, rows]))
  )
    .then((entries) => {
      const data = Object.fromEntries(entries)
      cache.data = data
      return data
    })
    .finally(() => {
      cache.inflight = null
    })

  return cache.inflight
}
