import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import {
  listenWhatsappChats,
  listenWhatsappMessages,
  openWhatsappInbox,
} from '../../services/whatsappChatsService.js'
import './whatsappChatsView.css'

const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
const URL_RE = /https?:\/\/[^\s]+/g

function toDate(value) {
  if (!value) return null
  if (typeof value.toDate === 'function') return value.toDate()
  if (value instanceof Date) return value
  return null
}

function formatWhen(value) {
  const date = toDate(value)
  if (!date) return ''
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${date.getDate()} ${MONTHS[date.getMonth()]}, ${hours}:${minutes}`
}

function phoneDigits(phone) {
  return String(phone || '').replace(/\D/g, '')
}

function formatPhone(phone) {
  const digits = phoneDigits(phone)
  if (!digits) return ''
  return `+${digits}`
}

function whatsappLink(phone) {
  const digits = phoneDigits(phone)
  return digits ? `https://wa.me/${digits}` : ''
}

function initialOf(name) {
  const match = String(name || '').match(/\p{L}|\p{N}/u)
  return (match?.[0] || '?').toUpperCase()
}

function imageUrlFromMessage(message) {
  const text = String(message.text || '').trim()
  const match = text.match(/https?:\/\/[^\s]+/)
  if (!match) return ''
  const url = match[0].replace(/[),.;]+$/, '')
  const looksLikePhoto = message.kind === 'image'
    || /^foto:/i.test(text)
    || /\.(jpe?g|png|webp|gif)(?:[?#].*)?$/i.test(url)
  return looksLikePhoto ? url : ''
}

function linkify(text) {
  const value = String(text || '')
  const nodes = []
  let cursor = 0
  for (const match of value.matchAll(URL_RE)) {
    const start = match.index ?? 0
    if (start > cursor) nodes.push(value.slice(cursor, start))
    const raw = match[0]
    const url = raw.replace(/[),.;]+$/, '')
    nodes.push(
      <a key={`${start}-${url}`} href={url} target="_blank" rel="noopener noreferrer">
        {url}
      </a>,
    )
    if (url.length < raw.length) nodes.push(raw.slice(url.length))
    cursor = start + raw.length
  }
  if (cursor < value.length) nodes.push(value.slice(cursor))
  return nodes
}

function useWideScreen() {
  const query = '(min-width: 900px)'
  const [wide, setWide] = useState(() => window.matchMedia(query).matches)
  useEffect(() => {
    const media = window.matchMedia(query)
    const onChange = () => setWide(media.matches)
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])
  return wide
}

function WhatsappChatsView() {
  const wide = useWideScreen()
  const [phase, setPhase] = useState('loading')
  const [db, setDb] = useState(null)
  const [chats, setChats] = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [messages, setMessages] = useState([])
  const [search, setSearch] = useState('')
  const stickToBottom = useRef(true)
  const scrollerRef = useRef(null)

  useEffect(() => {
    const nextDb = openWhatsappInbox()
    if (!nextDb) {
      setPhase('error')
      return undefined
    }
    setDb(nextDb)
    setPhase('ready')
    return undefined
  }, [])

  useEffect(() => {
    if (!db) return undefined
    return listenWhatsappChats(db, setChats, () => setPhase('error'))
  }, [db])

  useEffect(() => {
    if (!wide) return
    if (selectedId && chats.some((chat) => chat.id === selectedId)) return
    if (chats[0]) setSelectedId(chats[0].id)
  }, [wide, chats, selectedId])

  useEffect(() => {
    if (!db || !selectedId) {
      setMessages([])
      return undefined
    }
    stickToBottom.current = true
    return listenWhatsappMessages(db, selectedId, setMessages, () => setPhase('error'))
  }, [db, selectedId])

  useLayoutEffect(() => {
    const scroller = scrollerRef.current
    if (!scroller || !stickToBottom.current) return
    scroller.scrollTop = scroller.scrollHeight
  }, [messages, selectedId])

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase()
    if (!needle) return chats
    return chats.filter((chat) => {
      const name = String(chat.name || '').toLowerCase()
      const phone = formatPhone(chat.phone || chat.id).toLowerCase()
      return name.includes(needle) || phone.includes(needle) || String(chat.id).includes(needle)
    })
  }, [chats, search])

  const selected = chats.find((chat) => chat.id === selectedId) || null
  const showList = wide || !selectedId
  const showThread = wide || Boolean(selectedId)

  function onMessagesScroll() {
    const scroller = scrollerRef.current
    if (!scroller) return
    const distance = scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight
    stickToBottom.current = distance < 80
  }

  function openChat(id) {
    stickToBottom.current = true
    setSelectedId(id)
  }

  if (phase === 'loading') {
    return (
      <div className="waGate">
        <p>Cargando conversaciones…</p>
      </div>
    )
  }

  if (phase === 'error') {
    return (
      <div className="waGate">
        <p>No se pudo abrir la bandeja.</p>
      </div>
    )
  }

  return (
    <div className="waInbox">
      <aside className={showList ? 'waList' : 'waList waListHidden'}>
        <h1>Conversaciones IA</h1>
        <div className="waSearchWrap">
          <input
            className="waSearch"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar"
            aria-label="Buscar"
            type="search"
            enterKeyHint="search"
          />
        </div>
        <div className="waListScroll">
          {filtered.length === 0 ? <p className="waEmpty">Aún no hay conversaciones</p> : null}
          {filtered.map((chat) => {
            const name = chat.name || formatPhone(chat.id)
            return (
              <button
                key={chat.id}
                type="button"
                className={chat.id === selectedId ? 'waRow waRowOn' : 'waRow'}
                onClick={() => openChat(chat.id)}
              >
                <span className="waAvatar" aria-hidden="true">{initialOf(name)}</span>
                <span>
                  <span className="waName">{name}</span>
                  <span className="waPhone">{formatPhone(chat.phone || chat.id)}</span>
                </span>
              </button>
            )
          })}
        </div>
      </aside>
      <section className={showThread ? 'waThread' : 'waThread waThreadHidden'}>
        {selected ? (
          <>
            <header className="waThreadHead">
              <button type="button" className="waBack" onClick={() => setSelectedId('')} aria-label="Volver">
                ‹
              </button>
              <span className="waAvatar" aria-hidden="true">{initialOf(selected.name || selected.id)}</span>
              <div className="waThreadIdentity">
                <span className="waName">{selected.name || formatPhone(selected.id)}</span>
                <span className="waPhone">{formatPhone(selected.phone || selected.id)}</span>
              </div>
              <a
                className="waOpenChat"
                href={whatsappLink(selected.phone || selected.id)}
                target="_blank"
                rel="noopener noreferrer"
              >
                Ir al chat
              </a>
            </header>
            <div className="waMessages" ref={scrollerRef} onScroll={onMessagesScroll}>
              {messages.map((message) => {
                const outgoing = message.direction === 'out'
                const photo = imageUrlFromMessage(message)
                const caption = photo
                  ? String(message.text || '').replace(photo, '').replace(/^foto:\s*/i, '').trim()
                  : ''
                return (
                  <article key={message.id} className={outgoing ? 'waMsg waMsgOut' : 'waMsg waMsgIn'}>
                    <div className={outgoing ? 'waBubble waBubbleOut' : 'waBubble waBubbleIn'}>
                      {photo ? (
                        <>
                          <a href={photo} target="_blank" rel="noopener noreferrer">
                            <img className="waPhoto" src={photo} alt="Foto enviada" />
                          </a>
                          {caption ? <div className="waPhotoCaption">{linkify(caption)}</div> : null}
                        </>
                      ) : linkify(message.text)}
                    </div>
                    <div className="waMeta">
                      {formatWhen(message.at)}
                      {' · '}
                      {message.senderName || (outgoing ? 'Zona Paintball' : selected.name)}
                    </div>
                  </article>
                )
              })}
            </div>
          </>
        ) : (
          <p className="waEmpty">Elige una conversación</p>
        )}
      </section>
    </div>
  )
}

export default WhatsappChatsView
