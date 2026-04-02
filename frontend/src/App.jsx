import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Home from './pages/Home'
import Search from './pages/Search'
import MemoirDetail from './pages/MemoirDetail'
import Upload from './pages/Upload'
import Login from './pages/Login'
import { AuthProvider } from './context/AuthContext'
import AuthCallback from './pages/AuthCallback'
import Dashboard from './components/admin/Dashboard'
import Profile from './pages/Profile'
import Terms from './pages/Terms'
import Privacy from './pages/Privacy'

export default function App() {
  return (
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="search" element={<Search />} />
            <Route path="memoirs/:id" element={<MemoirDetail />} />
            <Route path="upload" element={<Upload />} />
            <Route path="login" element={<Login />} />
            <Route path="auth/callback" element={<AuthCallback />} />
            <Route path="admin" element={<Dashboard />} />
            <Route path="profile" element={<Profile />} />
            <Route path="terms" element={<Terms />} />
            <Route path="privacy" element={<Privacy />} />
          </Route>
        </Routes>
      </AuthProvider>
  )
}