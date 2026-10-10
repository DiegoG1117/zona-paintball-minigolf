import { GAME_KEY_PREFIX } from './constants.js'

export function clearGameStorage() {
  try {
    const keysToRemove = []
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i)
      if (key && key.startsWith(GAME_KEY_PREFIX)) keysToRemove.push(key)
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key))
  } catch {
    // ignore quota / private mode
  }
}

export function listStorageKeys(prefix) {
  const keys = []
  try {
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i)
      if (key && (!prefix || key.startsWith(prefix))) keys.push(key)
    }
  } catch {
    // ignore
  }
  return keys
}
