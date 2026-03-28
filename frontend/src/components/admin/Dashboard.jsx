import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  useAdminStats,
  usePendingMemoirs,
  usePendingUniversities,
} from '../../hooks/useAdmin'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '../../api/client'
import StatCard from '../../components/admin/StatCard'
import MemoirModerationCard from '../../components/admin/MemoirModerationCard'
import UniversityModerationCard from '../../components/admin/UniversityModerationCard'
import { useUpdateUserRole } from '../../hooks/useAdmin'

const TABS = [
  { id: 'stats',         label: 'Vue générale' },
  { id: 'memoirs',       label: 'Mémoires en attente' },
  { id: 'universities',  label: 'Universités en attente' },
  { id: 'users',         label: 'Utilisateurs' },
]

export default function Dashboard() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState(user?.role === 'ambassador' ? 'memoirs' : 'stats')

  const visibleTabs = TABS.filter(tab => {
    if (user?.role === 'ambassador') return tab.id === 'memoirs'
    return true
  })

  // Redirige si pas le droit
  if (user?.role !== 'admin' && user?.role !== 'moderator' && user?.role !== 'ambassador') {
    return <Navigate to="/" replace />
  }

  return (
    <div className="space-y-6">

      {/* En-tête */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Admin</h1>
        <p className="text-sm text-gray-500 mt-1">
          Bienvenue, {user?.full_name}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {visibleTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`text-sm px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contenu des tabs */}
      {activeTab === 'stats'        && <StatsTab />}
      {activeTab === 'memoirs'      && <MemoirsTab />}
      {activeTab === 'universities' && <UniversitiesTab />}
      {activeTab === 'users'        && <UsersTab />}
    </div>
  )
}

// ---- Tab Stats ----
function StatsTab() {
  const { data: stats, isLoading } = useAdminStats()

  if (isLoading) return <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
    ))}
  </div>

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard label="Mémoires publiés"      value={stats?.memoirs?.total}        icon="📄" color="blue" />
      <StatCard label="Mémoires en attente"   value={stats?.memoirs?.pending}       icon="⏳" color="orange" />
      <StatCard label="Universités validées"  value={stats?.universities?.total}    icon="🏛️" color="green" />
      <StatCard label="Utilisateurs"          value={stats?.users?.total}           icon="👥" color="purple" />
    </div>
  )
}

// ---- Tab Mémoires ----
function MemoirsTab() {
  const { data: memoirs, isLoading } = usePendingMemoirs()

  if (isLoading) return <p className="text-sm text-gray-500">Chargement...</p>

  if (!memoirs?.length) return (
    <div className="text-center py-16 space-y-2">
      <p className="text-3xl">🎉</p>
      <p className="text-gray-500 font-medium">Aucun mémoire en attente</p>
    </div>
  )

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500">{memoirs.length} mémoire(s) à modérer</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {memoirs.map(memoir => (
          <MemoirModerationCard key={memoir.id} memoir={memoir} />
        ))}
      </div>
    </div>
  )
}

// ---- Tab Universités ----
function UniversitiesTab() {
  const { data: universities, isLoading } = usePendingUniversities()

  if (isLoading) return <p className="text-sm text-gray-500">Chargement...</p>

  if (!universities?.length) return (
    <div className="text-center py-16 space-y-2">
      <p className="text-3xl">🎉</p>
      <p className="text-gray-500 font-medium">Aucune université en attente</p>
    </div>
  )

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500">{universities.length} université(s) à valider</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {universities.map(u => (
          <UniversityModerationCard key={u.id} university={u} />
        ))}
      </div>
    </div>
  )
}

// ---- Tab Utilisateurs ----
function UsersTab() {
  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => apiClient('/users'),
  })
  const { mutate: updateRole } = useUpdateUserRole()

  if (isLoading) return <p className="text-sm text-gray-500">Chargement...</p>

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500">{users?.length} utilisateur(s)</p>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['Utilisateur', 'Email', 'Rôle', 'Action'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {users?.map(user => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{user.full_name}</td>
                <td className="px-4 py-3 text-gray-500">{user.email}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    user.role === 'admin'     ? 'bg-red-100 text-red-700' :
                    user.role === 'moderator' ? 'bg-purple-100 text-purple-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <select
                    value={user.role}
                    onChange={e => updateRole({ id: user.id, role: e.target.value })}
                    className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="student">student</option>
                    <option value="ambassador">ambassador</option>
                    <option value="moderator">moderator</option>
                    <option value="admin">admin</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}