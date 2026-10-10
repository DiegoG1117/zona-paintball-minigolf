import { defineConfig, loadEnv } from 'vite'
import preact from '@preact/preset-vite'

function firebaseMessagingSw(env) {
  const source = `
importScripts('https://www.gstatic.com/firebasejs/11.10.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.10.0/firebase-messaging-compat.js');
firebase.initializeApp({
  apiKey: ${JSON.stringify(env.VITE_FIREBASE_API_KEY || '')},
  authDomain: ${JSON.stringify(env.VITE_FIREBASE_AUTH_DOMAIN || '')},
  projectId: ${JSON.stringify(env.VITE_FIREBASE_PROJECT_ID || '')},
  storageBucket: ${JSON.stringify(env.VITE_FIREBASE_STORAGE_BUCKET || '')},
  messagingSenderId: ${JSON.stringify(env.VITE_FIREBASE_MESSAGING_SENDER_ID || '')},
  appId: ${JSON.stringify(env.VITE_FIREBASE_APP_ID || '')}
});
const messaging = firebase.messaging();
messaging.onBackgroundMessage((payload) => {
  const data = payload.data || {};
  if (data.type === 'matchFinished') {
    self.registration.showNotification('Partida finalizada', {
      body: 'El anfitrión cerró la partida. Abre la app para ver el resultado.',
    });
  }
});
`
  return {
    name: 'firebase-messaging-sw',
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'firebase-messaging-sw.js', source })
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === '/firebase-messaging-sw.js') {
          res.setHeader('Content-Type', 'application/javascript')
          res.end(source)
          return
        }
        next()
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [preact(), firebaseMessagingSw(env)],
  }
})
