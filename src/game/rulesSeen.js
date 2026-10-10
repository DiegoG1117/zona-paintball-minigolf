const RULES_SEEN_KEY = 'zona_rules_seen_v1'

export function hasSeenRules() {
  try {
    return localStorage.getItem(RULES_SEEN_KEY) === '1'
  } catch {
    return false
  }
}

export function markRulesSeen() {
  try {
    localStorage.setItem(RULES_SEEN_KEY, '1')
  } catch {
    // ignore quota / private mode
  }
}
