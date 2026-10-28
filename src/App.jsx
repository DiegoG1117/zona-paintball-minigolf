import './App.css'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import MainView from './views/mainView/mainView.jsx'
import GameModesView from './views/gameModesView/gameModesView.jsx'
import ClassicModeView from './views/classicModeView/classicModeView.jsx'
import RunnerModeView from './views/runnerModeView/runnerModeView.jsx'
import DraftcardModeView from './views/draftcardModeView/draftcardModeView.jsx'
import NewPlayersView from './views/newPlayersView/newPlayersView.jsx'
import ResultsView from './views/resultsView/resultsView.jsx'
import LoginView from './views/loginView/loginView.jsx'
import RegisterView from './views/registerView/registerView.jsx'
import RankingView from './views/rankingView/rankingView.jsx'
import ProfileView from './views/profileView/profileView.jsx'
import PlayView from './views/playView/playView.jsx'
import MatchLobbyView from './views/matchLobbyView/matchLobbyView.jsx'
import WhatsappChatsView from './views/whatsappChatsView/whatsappChatsView.jsx'
import RequireAuth from './components/RequireAuth/RequireAuth.jsx'
import AppNav from './components/AppNav/AppNav.jsx'
import { useAuth } from './context/AuthContext.jsx'

const HIDDEN_NAV_PATHS = new Set([
  '/gamemodes',
  '/gamemodes/classic',
  '/gamemodes/runner',
  '/gamemodes/draftcard',
  '/results',
  '/newplayers',
  '/zpminigolf/chatswhatsapp',
])

function App() {
  const { user } = useAuth()
  const location = useLocation()
  const showNav = Boolean(user) && !HIDDEN_NAV_PATHS.has(location.pathname)

  return (
    <div className={showNav ? 'appWithBottomNav' : undefined}>
      <Routes>
        <Route path="/" element={<MainView />} />
        <Route path="/login" element={<LoginView />} />
        <Route path="/register" element={<RegisterView />} />
        <Route path="/ranking" element={<RankingView />} />
        <Route path="/profile" element={<RequireAuth><ProfileView /></RequireAuth>} />
        <Route path="/jugar" element={<RequireAuth><PlayView /></RequireAuth>} />
        <Route path="/match/create" element={<Navigate to="/jugar" replace />} />
        <Route path="/match/join" element={<Navigate to="/jugar" replace />} />
        <Route path="/match/:matchId/lobby" element={<RequireAuth><MatchLobbyView /></RequireAuth>} />
        <Route path="/gamemodes" element={<GameModesView />} />
        <Route path="/newplayers" element={<NewPlayersView />} />
        <Route path="/gamemodes/classic" element={<ClassicModeView />} />
        <Route path="/gamemodes/runner" element={<RunnerModeView />} />
        <Route path="/gamemodes/draftcard" element={<DraftcardModeView />} />
        <Route path="/results" element={<ResultsView />} />
        <Route path="/zpminigolf/chatswhatsapp" element={<WhatsappChatsView />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <AppNav />
    </div>
  )
}

export default App
