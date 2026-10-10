/* eslint-disable react-refresh/only-export-components */
export const DEFAULT_AVATAR_ID = 'golf-ball'

export const AVATARS = [
  { id: 'helmet-green', label: 'Soldado verde', src: '/avatars/helmet-green.webp' },
  { id: 'helmet-blue', label: 'Soldado azul', src: '/avatars/helmet-blue.webp' },
  { id: 'helmet-red', label: 'Soldado rojo', src: '/avatars/helmet-red.webp' },
  { id: 'helmet-pink', label: 'Soldado rosa', src: '/avatars/helmet-pink.webp' },
  { id: 'golfer-red', label: 'Golfista rojo', src: '/avatars/golfer-red.webp' },
  { id: 'golfer-swing', label: 'Golfista en swing', src: '/avatars/golfer-swing.webp' },
  { id: 'golfer-blue', label: 'Golfista azul', src: '/avatars/golfer-blue.webp' },
  { id: 'golfer-pink', label: 'Golfista rosa', src: '/avatars/golfer-pink.webp' },
  { id: 'golf-ball', label: 'Pelota', src: '/avatars/golf-ball.webp' },
  { id: 'golf-club', label: 'Palo de golf', src: '/avatars/golf-club.webp' },
]

const AVATARS_BY_ID = new Map(AVATARS.map((item) => [item.id, item]))

export function isAvatarId(value) {
  return AVATARS_BY_ID.has(value)
}

export function getAvatar(avatarId) {
  return AVATARS_BY_ID.get(avatarId) || AVATARS_BY_ID.get(DEFAULT_AVATAR_ID)
}

export function resolveAvatarId(source) {
  if (!source) return DEFAULT_AVATAR_ID
  if (typeof source === 'string') return isAvatarId(source) ? source : DEFAULT_AVATAR_ID
  const photoURL = source.photoURL || ''
  const avatarId = source.avatarId || ''
  if (isAvatarId(photoURL)) return photoURL
  if (isAvatarId(avatarId)) return avatarId
  return DEFAULT_AVATAR_ID
}

function isRemotePhoto(value) {
  return typeof value === 'string' && /^https?:\/\//i.test(value)
}

export function ProfileAvatar({ avatarId, photoURL, size = 36, className = '', label }) {
  const remote = isRemotePhoto(photoURL)
  const avatar = getAvatar(resolveAvatarId({ avatarId, photoURL: remote ? '' : photoURL }))
  const text = label || avatar.label
  return (
    <span
      className={`profileAvatar ${className}`.trim()}
      title={text}
      style={{ width: size, height: size }}
    >
      <img src={remote ? photoURL : avatar.src} alt={text} width={size} height={size} />
    </span>
  )
}
