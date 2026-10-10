import { HOLE_PREFIX, ROSTER_KEY, RUNNER_KEY } from './constants.js'
import { listStorageKeys } from './clearGameStorage.js'

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

export function readLocalRoster() {
  const parsed = readJson(ROSTER_KEY, [])
  return Array.isArray(parsed) ? parsed : []
}

export function sumHoleStrokes(playerList = readLocalRoster()) {
  const holeKeys = listStorageKeys(HOLE_PREFIX)
  const strokeByPlayer = {}
  holeKeys.forEach((hk) => {
    try {
      const perHole = JSON.parse(localStorage.getItem(hk) || '{}') || {}
      Object.entries(perHole).forEach(([pid, strokes]) => {
        const s = Number(strokes)
        strokeByPlayer[pid] = (strokeByPlayer[pid] || 0) + (Number.isFinite(s) ? s : 0)
      })
    } catch {
      // ignore malformed hole maps
    }
  })
  return playerList.map((p) => ({
    id: p.id,
    name: p.name,
    score: strokeByPlayer[p.id] ?? 0,
  }))
}

export function sumRunnerTimes(playerList = readLocalRoster()) {
  const parsed = readJson(RUNNER_KEY, {})
  const runner = parsed && typeof parsed === 'object' ? parsed : {}
  const totalMsByPlayer = {}
  Object.entries(runner).forEach(([pid, holeMap]) => {
    const total = Object.values(holeMap || {}).reduce((acc, v) => acc + (Number(v) || 0), 0)
    totalMsByPlayer[pid] = total
  })
  return playerList.map((p) => ({
    id: p.id,
    name: p.name,
    score: totalMsByPlayer[p.id] ?? Number.POSITIVE_INFINITY,
  }))
}

export function computeTotalFromHoles(holes = {}) {
  return Object.values(holes).reduce((acc, v) => acc + (Number(v) || 0), 0)
}

/**
 * Same ranking formula the results screen already used:
 * stroke play = sum of hole strokes; runner = sum of elapsedMs. Lower is better.
 */
export function computeLocalResults({ returnTo = '' } = {}) {
  const playerList = readLocalRoster()
  const cameFromRunner = typeof returnTo === 'string' && returnTo.includes('/gamemodes/runner')
  const holeKeys = listStorageKeys(HOLE_PREFIX)

  let results = []
  let mode = 'classic'

  if (!cameFromRunner && holeKeys.length > 0) {
    results = sumHoleStrokes(playerList)
    mode = returnTo.includes('draftcard') ? 'miniuno' : 'classic'
  } else {
    results = sumRunnerTimes(playerList)
    mode = 'runner'
  }

  results.sort((a, b) => (a.score ?? 0) - (b.score ?? 0))
  return { results, mode }
}

export function formatGameScore(mode, score) {
  if (score == null || !Number.isFinite(Number(score))) return '—'
  const n = Number(score)
  if (mode === 'runner') {
    const totalSeconds = Math.max(0, Math.round(n / 1000))
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }
  return `${n} golpes`
}
