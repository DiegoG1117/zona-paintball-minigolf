export const GAME_KEY_PREFIX = 'zpminigolf_'
export const ROSTER_KEY = 'zpminigolf_userScores'
export const HOLE_PREFIX = 'zpminigolf_scores_hole_'
export const RUNNER_KEY = 'zpminigolf_runner_results'
export const ACTIVE_MATCH_KEY = 'zpminigolf_active_match_id'

export const COURSE_ID = 'default-5'
export const HOLE_COUNT = 5
export const HOLE_IDS = ['1', '2', '3', '4', '5']
export const RUNNER_HOLES = ['Hoyo 1', 'Hoyo 2', 'Hoyo 3', 'Hoyo 4', 'Hoyo 5']

export const MODES = {
  classic: 'classic',
  runner: 'runner',
  miniuno: 'miniuno',
}

export const MODE_LABELS = {
  classic: 'Clásico',
  runner: 'Contra Reloj',
  miniuno: 'MiniUno',
}

export const MODE_ROUTES = {
  classic: '/gamemodes/classic',
  runner: '/gamemodes/runner',
  miniuno: '/gamemodes/draftcard',
}

export const BEST_FIELDS = {
  classic: 'bestClassic',
  runner: 'bestRunner',
  miniuno: 'bestMiniuno',
}

export const TOTAL_FIELDS = {
  classic: 'totalGamesClassic',
  runner: 'totalGamesRunner',
  miniuno: 'totalGamesMiniuno',
}

export const JOIN_CODE_LENGTH = 6
export const RANKING_LIMIT = 100
export const HISTORY_PAGE_SIZE = 20
export const SCORE_WRITE_DEBOUNCE_MS = 1500
export const SCORE_POLL_MS = 9000
