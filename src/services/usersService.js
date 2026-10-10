import {
  arrayRemove,
  arrayUnion,
  doc,
  getCountFromServer,
  getDoc,
  query,
  collection,
  where,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore'
import { getDb } from '../firebase/config.js'
import { DEFAULT_AVATAR_ID, isAvatarId, resolveAvatarId } from '../avatars/catalog.jsx'
import { BEST_FIELDS } from '../game/constants.js'

export function normalizeUsername(value) {
  return String(value || '').trim().toLowerCase()
}

export function validateUsername(value) {
  const username = String(value || '').trim()
  if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
    throw new Error('El username debe tener 3-20 caracteres (letras, números o _)')
  }
  return username
}

export async function getUserProfile(uid) {
  const db = getDb()
  if (!db || !uid) return null
  const snap = await getDoc(doc(db, 'users', uid))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase()
}

export async function resolveLoginEmail(identifier) {
  const raw = String(identifier || '').trim()
  if (!raw) throw new Error('Escribe tu email o username')
  if (raw.includes('@')) return raw
  const db = getDb()
  if (!db) throw new Error('Firebase no está configurado')
  const snap = await getDoc(doc(db, 'usernames', normalizeUsername(raw)))
  if (!snap.exists()) throw new Error('No encontramos ese username')
  const email = snap.data()?.email
  if (!email) throw new Error('Entra una vez con tu correo para activar el acceso por username')
  return email
}

export async function linkUsernameEmail(uid, usernameLower, email) {
  const db = getDb()
  const safeEmail = normalizeEmail(email)
  if (!db || !uid || !usernameLower || !safeEmail) return
  const ref = doc(db, 'usernames', usernameLower)
  const snap = await getDoc(ref)
  if (!snap.exists() || snap.data()?.uid !== uid || snap.data()?.email) return
  await updateDoc(ref, { email: safeEmail })
}

export async function createUserProfile({ uid, username, displayName, email }) {
  const db = getDb()
  if (!db) throw new Error('Firebase no está configurado')
  const safeUsername = validateUsername(username)
  const usernameLower = normalizeUsername(safeUsername)
  const visibleName = (displayName || safeUsername).trim()
  const safeEmail = normalizeEmail(email)

  await runTransaction(db, async (tx) => {
    const unameRef = doc(db, 'usernames', usernameLower)
    const unameSnap = await tx.get(unameRef)
    if (unameSnap.exists()) throw new Error('Ese username ya está en uso')
    tx.set(unameRef, { uid, email: safeEmail })
    tx.set(doc(db, 'users', uid), {
      username: safeUsername,
      usernameLower,
      displayName: visibleName,
      photoURL: DEFAULT_AVATAR_ID,
      avatarId: DEFAULT_AVATAR_ID,
      createdAt: serverTimestamp(),
      totalGamesClassic: 0,
      totalGamesRunner: 0,
      totalGamesMiniuno: 0,
    })
  })
  return getUserProfile(uid)
}

export async function updateUserProfile(uid, patch) {
  const db = getDb()
  if (!db) throw new Error('Firebase no está configurado')
  const allowed = {}
  if (typeof patch.displayName === 'string') allowed.displayName = patch.displayName.trim()
  if (typeof patch.avatarId === 'string') {
    allowed.avatarId = isAvatarId(patch.avatarId) ? patch.avatarId : DEFAULT_AVATAR_ID
  }
  if (typeof patch.photoURL === 'string') {
    const photoIsAvatar = isAvatarId(patch.photoURL)
    const photoIsRemote = /^https?:\/\//i.test(patch.photoURL)
    allowed.photoURL = photoIsAvatar || photoIsRemote
      ? patch.photoURL
      : resolveAvatarId(patch.avatarId || patch.photoURL)
  }
  if (allowed.avatarId && (!allowed.photoURL || isAvatarId(allowed.photoURL))) {
    allowed.photoURL = allowed.avatarId
  }
  const linkedEmail = normalizeEmail(patch.email)

  if (patch.username) {
    const safeUsername = validateUsername(patch.username)
    const usernameLower = normalizeUsername(safeUsername)
    await runTransaction(db, async (tx) => {
      const userRef = doc(db, 'users', uid)
      const userSnap = await tx.get(userRef)
      if (!userSnap.exists()) throw new Error('Perfil no encontrado')
      const current = userSnap.data()
      if (current.usernameLower !== usernameLower) {
        const unameRef = doc(db, 'usernames', usernameLower)
        const taken = await tx.get(unameRef)
        if (taken.exists() && taken.data().uid !== uid) {
          throw new Error('Ese username ya está en uso')
        }
        let email = linkedEmail
        if (current.usernameLower) {
          const oldRef = doc(db, 'usernames', current.usernameLower)
          const oldSnap = await tx.get(oldRef)
          if (!email) email = normalizeEmail(oldSnap.data()?.email)
          tx.delete(oldRef)
        }
        tx.set(unameRef, { uid, ...(email ? { email } : {}) })
      }
      tx.update(userRef, {
        ...allowed,
        username: safeUsername,
        usernameLower,
      })
    })
    return getUserProfile(uid)
  }

  if (Object.keys(allowed).length) {
    await updateDoc(doc(db, 'users', uid), allowed)
  }
  return getUserProfile(uid)
}

export async function addFcmToken(uid, token) {
  const db = getDb()
  if (!db || !uid || !token) return
  const ref = doc(db, 'fcmTokens', uid)
  try {
    await updateDoc(ref, { tokens: arrayUnion(token) })
  } catch {
    await setDoc(ref, { tokens: [token] }, { merge: true })
  }
}

export async function removeFcmToken(uid, token) {
  const db = getDb()
  if (!db || !uid || !token) return
  await updateDoc(doc(db, 'fcmTokens', uid), { tokens: arrayRemove(token) }).catch(() => {})
}

export async function countBetterScores(mode, myScore) {
  const db = getDb()
  const field = BEST_FIELDS[mode]
  if (!db || !field || myScore == null || !Number.isFinite(Number(myScore))) return null
  const q = query(
    collection(db, 'users'),
    where(field, '<', Number(myScore))
  )
  const snap = await getCountFromServer(q)
  return snap.data().count + 1
}
