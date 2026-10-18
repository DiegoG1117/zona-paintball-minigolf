/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { isFirebaseConfigured } from '../firebase/config.js'
import {
  loginWithEmail,
  logout as firebaseLogout,
  registerWithEmail,
  sendResetEmail,
  subscribeAuth,
} from '../firebase/auth.js'
import { listenForegroundMessages, registerFcmToken } from '../firebase/messaging.js'
import {
  addFcmToken,
  createUserProfile,
  getUserProfile,
  linkUsernameEmail,
  resolveLoginEmail,
  updateUserProfile as persistProfile,
} from '../services/usersService.js'
import { persistActiveMatchId } from '../services/matchesService.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(isFirebaseConfigured)
  const [fcmToken, setFcmToken] = useState(null)

  const refreshProfile = useCallback(async (uid) => {
    const id = uid || user?.uid
    if (!id) {
      setProfile(null)
      return null
    }
    const next = await getUserProfile(id)
    setProfile(next)
    return next
  }, [user?.uid])

  useEffect(() => {
    const unsub = subscribeAuth(async (nextUser) => {
      setUser(nextUser)
      if (!nextUser) {
        setProfile(null)
        setLoading(false)
        return
      }
      try {
        const nextProfile = await getUserProfile(nextUser.uid)
        setProfile((current) => {
          if (!nextProfile && current?.id === nextUser.uid) return current
          return nextProfile
        })
      } catch {
        setProfile((current) => (current?.id === nextUser.uid ? current : null))
      } finally {
        setLoading(false)
      }
    })
    return unsub
  }, [])

  useEffect(() => {
    if (!user?.uid) return undefined
    let cancelled = false
    registerFcmToken().then((token) => {
      if (!token || cancelled) return
      setFcmToken(token)
      addFcmToken(user.uid, token).catch(() => {})
    })
    return () => {
      cancelled = true
    }
  }, [user?.uid])

  useEffect(() => {
    if (!user?.uid) return undefined
    let unsub = () => {}
    listenForegroundMessages((payload) => {
      window.dispatchEvent(new CustomEvent('zp-fcm', { detail: payload?.data || payload }))
    }).then((fn) => {
      unsub = fn || (() => {})
    })
    return () => unsub()
  }, [user?.uid])

  const register = useCallback(async ({ email, password, username, displayName, avatarId }) => {
    const cred = await registerWithEmail(email, password)
    try {
      const next = await createUserProfile({
        uid: cred.user.uid,
        username,
        displayName,
        email,
        avatarId,
      })
      setUser(cred.user)
      setProfile(next)
      return cred.user
    } catch (err) {
      try { await cred.user.delete() } catch { /* ignore */ }
      throw err
    }
  }, [])

  const login = useCallback(async (identifier, password) => {
    const email = await resolveLoginEmail(identifier)
    const cred = await loginWithEmail(email, password)
    const next = await refreshProfile(cred.user.uid)
    if (next?.usernameLower) {
      await linkUsernameEmail(cred.user.uid, next.usernameLower, cred.user.email)
    }
    return cred.user
  }, [refreshProfile])

  const logout = useCallback(async () => {
    persistActiveMatchId(null)
    await firebaseLogout()
    setProfile(null)
  }, [])

  const resetPassword = useCallback(async (identifier) => {
    const email = await resolveLoginEmail(identifier)
    return sendResetEmail(email)
  }, [])

  const updateProfile = useCallback(async (patch) => {
    if (!user?.uid) throw new Error('Inicia sesión primero')
    const next = await persistProfile(user.uid, { ...patch, email: user.email })
    setProfile(next)
    return next
  }, [user?.uid, user?.email])

  const value = useMemo(
    () => ({
      configured: isFirebaseConfigured,
      user,
      profile,
      loading,
      fcmToken,
      register,
      login,
      logout,
      resetPassword,
      refreshProfile,
      updateProfile,
    }),
    [
      user,
      profile,
      loading,
      fcmToken,
      register,
      login,
      logout,
      resetPassword,
      refreshProfile,
      updateProfile,
    ]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}
