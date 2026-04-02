import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  useAdminStats,
  usePendingMemoirs,
  usePendingUniversities,
  usePendingFields,
  useUpdateFieldStatus,
  useModerationHistory
} from "../../hooks/useAdmin";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../api/client";
import { toast } from "sonner";
import { 
  LayoutDashboard, FileText, Building2, GraduationCap, Users, History, 
  BarChart3, Menu, X, ChevronRight
} from "lucide-react";
import StatCard from "../../components/admin/StatCard";
import MemoirModerationCard from "../../components/admin/MemoirModerationCard";
import UniversityModerationCard from "../../components/admin/UniversityModerationCard";
import { useUpdateUserRole } from "../../hooks/useAdmin";
import RoleAssigner from "../../components/admin/RoleAssigner";
import RoleEditModal from "../../components/admin/RoleEditModal";

const TABS = [
  { id: "stats", label: "Vue générale", icon: BarChart3 },
  { id: "memoirs", label: "Mémoires", icon: FileText },
  { id: "universities", label: "Universités", icon: Building2 },
  { id: "fields", label: "Filières", icon: GraduationCap },
  { id: "users", label: "Utilisateurs", icon: Users },
  { id: "history", label: "Historique", icon: History },
];

export default function Dashboard() {
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState(
    currentUser?.role === "ambassador" ? "memoirs" : "stats",
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const visibleTabs = TABS.filter((tab) => {
    if (currentUser?.role === "ambassador") return tab.id === "memoirs" || tab.id === "history";
    if (currentUser?.role === "moderator") {
      if (tab.id === "users") return false;
      return true;
    }
    if (currentUser?.role !== "admin" && tab.id === "users") return false;
    return true;
  });

  // Redirige si pas le droit
  if (
    currentUser?.role !== "admin" &&
    currentUser?.role !== "moderator" &&
    currentUser?.role !== "ambassador"
  ) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Admin</h1>
          <p className="text-sm text-gray-500 mt-1">
            Bienvenue, {currentUser?.full_name}
          </p>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="lg:hidden p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-lg"
        >
          {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Navigation desktop avec icônes */}
      <div className="hidden lg:flex gap-1 bg-gray-100 p-1 rounded-xl w-full max-w-full overflow-x-auto whitespace-nowrap">
        {visibleTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 text-sm px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Sidebar mobile */}
      {isSidebarOpen && (
        <div className="lg:hidden bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
          <div className="p-2">
            {visibleTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 text-sm px-4 py-3 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Contenu des tabs */}
      {activeTab === "stats" && <StatsTab />}
      {activeTab === "memoirs" && <MemoirsTab />}
      {activeTab === "universities" && <UniversitiesTab />}
      {activeTab === "fields" && <FieldsTab />}
      {activeTab === "users" && <UsersTab />}
      {activeTab === "history" && <HistoryTab />}
    </div>
  );
}

// ---- Tab Stats ----
function StatsTab() {
  const { data: stats, isLoading } = useAdminStats();

  if (isLoading)
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        label="Mémoires publiés"
        value={stats?.memoirs?.total}
        icon={FileText}
        color="blue"
      />
      <StatCard
        label="Mémoires en attente"
        value={stats?.memoirs?.pending}
        icon={FileText}
        color="orange"
      />
      <StatCard
        label="Universités validées"
        value={stats?.universities?.total}
        icon={Building2}
        color="green"
      />
      <StatCard
        label="Utilisateurs"
        value={stats?.users?.total}
        icon={Users}
        color="purple"
      />
    </div>
  );
}

// ---- Tab Mémoires ----
function MemoirsTab() {
  const { data: memoirs, isLoading } = usePendingMemoirs();

  if (isLoading) return <p className="text-sm text-gray-500">Chargement...</p>;

  if (!memoirs?.length)
    return (
      <div className="text-center py-16 space-y-2">
        <p className="text-3xl">🎉</p>
        <p className="text-gray-500 font-medium">Aucun mémoire en attente</p>
      </div>
    );

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500">
        {memoirs.length} mémoire(s) à modérer
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {memoirs.map((memoir) => (
          <MemoirModerationCard key={memoir.id} memoir={memoir} />
        ))}
      </div>
    </div>
  );
}

// ---- Tab Universités ----
function UniversitiesTab() {
  const { data: universities, isLoading } = usePendingUniversities();

  if (isLoading) return <p className="text-sm text-gray-500">Chargement...</p>;

  if (!universities?.length)
    return (
      <div className="text-center py-16 space-y-2">
        <p className="text-3xl">🎉</p>
        <p className="text-gray-500 font-medium">
          Aucune université en attente
        </p>
      </div>
    );

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500">
        {universities.length} université(s) à valider
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {universities.map((u) => (
          <UniversityModerationCard key={u.id} university={u} />
        ))}
      </div>
    </div>
  );
}

// ---- Tab Filières ----
function FieldsTab() {
  const { data: fields, isLoading } = usePendingFields();
  const { mutate: updateField } = useUpdateFieldStatus();

  if (isLoading) return <p className="text-sm text-gray-500">Chargement...</p>;

  if (!fields?.length)
    return (
      <div className="text-center py-16 space-y-2">
        <p className="text-3xl">🎉</p>
        <p className="text-gray-500 font-medium">Aucune filière en attente</p>
      </div>
    );

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500">{fields.length} filière(s) à valider</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map((f) => (
          <div key={f.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
              <div>
                  <h3 className="font-bold text-gray-900">{f.label}</h3>
                  <p className="text-xs text-gray-500 mt-1 mt-1">Suggérée par l'utilisateur {f.submitted_by ? `#${f.submitted_by}` : 'Inconnu'}</p>
              </div>
              <div className="flex gap-2 mt-4">
                  <button onClick={() => updateField({ id: f.id, status: 'approved' }, {
                      onSuccess: () => toast.success("Filière validée avec succès !"),
                      onError: (err) => toast.error(`Erreur: ${err.message}`)
                  })} className="flex-1 bg-green-50 text-green-700 font-semibold py-2 rounded-xl hover:bg-green-100 transition-colors">
                      Valider
                  </button>
                  <button onClick={() => {
                      const reason = window.prompt("Motif de refus pour cette filière (envoyé par email) ?");
                      if (!reason) return;
                      updateField({ id: f.id, status: 'rejected', rejection_reason: reason }, {
                          onSuccess: () => toast.success("Filière rejetée, notification envoyée."),
                          onError: (err) => toast.error(`Erreur: ${err.message}`)
                      });
                  }} className="flex-1 bg-red-50 text-red-700 font-semibold py-2 rounded-xl hover:bg-red-100 transition-colors">
                      Rejeter
                  </button>
              </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---- Tab Utilisateurs ----
function UsersTab() {
  const { user: currentUser } = useAuth();
  const {
    data: users,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => apiClient("/users"),
  });
  const { mutate: updateRole } = useUpdateUserRole();
  const [editingUser, setEditingUser] = useState(null);

  const handleSave = (payload) => {
    updateRole(payload, {
      onSuccess: () => refetch(),
    });
  };

  if (isLoading) return <p className="text-sm text-gray-500">Chargement...</p>;

  return (
    <>
      <div className="space-y-3">
        <p className="text-sm text-gray-500">{users?.length} utilisateur(s)</p>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
          <table className="w-full text-sm min-w-max">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {["Utilisateur", "Email", "Rôle", "Action"].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-xs font-medium text-gray-500"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users?.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {user.full_name}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{user.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${
                        user.role === "admin"
                          ? "bg-red-100 text-red-700"
                          : user.role === "moderator"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {user.id !== currentUser?.id ? (
                      <RoleAssigner user={user} onEdit={setEditingUser} />
                    ) : (
                      <span className="text-xs text-gray-400 italic">
                        C'est vous
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de modification du rôle */}
      {editingUser && (
        <RoleEditModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSave={handleSave}
        />
      )}
    </>
  );
}

// ---- Tab Historique ----
function HistoryTab() {
  const { data: history, isLoading } = useModerationHistory();

  if (isLoading) return <p className="text-sm text-gray-500">Chargement...</p>;

  if (!history?.length) {
    return (
      <div className="text-center py-16 space-y-2">
        <p className="text-gray-500 font-medium">Aucun historique de modération disponible</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-gray-800">Dernières décisions de l'équipe</h2>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <ul className="divide-y divide-gray-50">
          {history.map((item) => (
             <li key={item.id} className="p-4 hover:bg-gray-50 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full mr-2">
                      {item.type}
                    </span>
                    {item.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Modéré par <span className="font-medium text-gray-700">{item.moderator_name}</span> le{' '}
                    {new Date(item.moderated_at).toLocaleString('fr-FR')}
                  </p>
                  {item.rejection_reason && (
                    <p className="text-xs text-red-600 mt-2 bg-red-50 p-2 rounded-md border border-red-100 w-fit">
                      <span className="font-bold">Motif du rejet :</span> {item.rejection_reason}
                    </p>
                  )}
                </div>
                <div>
                   <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                     item.status === 'approved' ? 'bg-green-100 text-green-700' :
                     item.status === 'rejected' ? 'bg-red-100 text-red-700' :
                     'bg-cyan-100 text-cyan-700'
                   }`}>
                     {item.status === 'approved' ? 'Validé' : 
                      item.status === 'rejected' ? 'Rejeté' :
                      item.status === 'pre_validated' ? 'Pré-validé' : item.status}
                   </span>
                </div>
             </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
