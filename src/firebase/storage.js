import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { getFirebaseStorage } from './config.js'

export function avatarPath(uid) {
  return `profile-images/${uid}/avatar.webp`
}

export async function uploadAvatar(uid, blob) {
  const storage = getFirebaseStorage()
  if (!storage) throw new Error('Firebase no está configurado')
  const fileRef = ref(storage, avatarPath(uid))
  await uploadBytes(fileRef, blob, { contentType: 'image/webp' })
  return getDownloadURL(fileRef)
}

export async function deleteAvatar(uid) {
  const storage = getFirebaseStorage()
  if (!storage) return
  try {
    await deleteObject(ref(storage, avatarPath(uid)))
  } catch {
    // ignore missing file
  }
}
