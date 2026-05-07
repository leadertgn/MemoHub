import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  useAdminStats,
  usePendingMemoirs,
  usePendingUniversities,
  usePendingFields,
  useUpdateFieldStatus,
  useModerationHistory,
  usePendingApplications,
  useUpdateApplicationStatus
} from "../../hooks/useAdmin";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../api/client";
import { toast } from "sonner";
import { 
    FileText, Building2, GraduationCap, Users, History,
    BarChart3, Menu, X, PartyPopper, UserPlus, Info, Check, XCircle, ArrowRight
} from "lucide-react";
import StatCard from "../../components/admin/StatCard";
import MemoirModerationCard from "../../components/admin/MemoirModerationCard";
import UniversityModerationCard from "../../components/admin/UniversityModerationCard";
import { useUpdateUserRole } from "../../hooks/useAdmin";
import RoleAssigner from "../../components/admin/RoleAssigner";
import RoleEditModal from "../../components/admin/RoleEditModal";
import { Button } from "../ui/Button";

const TABS = [
  { id: "stats", label: "Contrôle", icon: BarChart3 },
  { id: "memoirs", label: "Manuscrit", icon: FileText },
  { id: "universities", label: "Instituts", icon: Building2 },
  { id: "fields", label: "Disciplines", icon: GraduationCap },
  { id: "users", label: "Individus", icon: Users },
  { id: "applications", label: "Protocoles", icon: UserPlus },
  { id: "history", label: "Registre", icon: History },
];

export default function Dashboard() {
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState(
    currentUser?.role === "ambassador" ? "memoirs" : "stats",
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const visibleTabs = TABS.filter((tab) => {
    if (currentUser?.role === "ambassador") return tab.id === "memoirs" || tab.id === "history";
    if (currentUser?.role === "moderator") return tab.id !== "users";
    return !(currentUser?.role !== "admin" && tab.id === "users");
  });

  if (!["admin", "moderator", "ambassador"].includes(currentUser?.role)) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="relative pb-32">
      {/* Background Decor */}
      <div className="absolute inset-0 grid grid-cols-6 md:grid-cols-12 gap-px bg-[var(--color-stone)]/10 -z-20 pointer-events-none" />

      <section className="pt-12 px-6 max-w-7xl mx-auto space-y-16">
        {/* Header Admin */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-[var(--color-obsidian)] pb-12">
          <div className="space-y-4">
             <div className="inline-flex items-center gap-3 font-mono text-[10px] uppercase tracking-widest text-[var(--color-cinnabar)]">
                <span className="w-8 h-px bg-[var(--color-cinnabar)]" />
                Console d'Administration / {currentUser?.role}
             </div>
             <h1 className="text-5xl md:text-7xl font-serif text-[var(--color-obsidian)] leading-none tracking-tighter">
               Gestion de <br /> <span className="italic opacity-30">l'Archive.</span>
             </h1>
          </div>
          <div className="flex items-center gap-4">
             <button 
               onClick={() => setIsSidebarOpen(!isSidebarOpen)}
               className="lg:hidden p-3 border border-[var(--color-obsidian)]/10"
             >
               {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
             </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Navigation Latérale Avant-Garde */}
          <aside className={`lg:col-span-3 space-y-4 ${showSidebarMobile(isSidebarOpen)}`}>
            <div className="sticky top-32 space-y-2">
              <h2 className="font-mono text-[10px] uppercase tracking-[0.4em] opacity-30 mb-8">Navigation Système</h2>
              {visibleTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center justify-between p-4 font-serif text-lg transition-all border ${
                    activeTab === tab.id 
                      ? 'border-[var(--color-obsidian)] bg-white text-[var(--color-obsidian)]' 
                      : 'border-transparent opacity-40 hover:opacity-100'
                  }`}
                >
                  <span className="flex items-center gap-4">
                    <tab.icon className="w-4 h-4 opacity-40" />
                    {tab.label}
                  </span>
                  {activeTab === tab.id && <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-cinnabar)]" />}
                </button>
              ))}
            </div>
          </aside>

          {/* Zone de Travail */}
          <main className="lg:col-span-9 space-y-12">
            {activeTab === "stats" && <StatsTab />}
            {activeTab === "memoirs" && <MemoirsTab />}
            {activeTab === "universities" && <UniversitiesTab />}
            {activeTab === "fields" && <FieldsTab />}
            {activeTab === "users" && <UsersTab />}
            {activeTab === "applications" && <ApplicationsTab />}
            {activeTab === "history" && <HistoryTab />}
          </main>
        </div>
      </section>
    </div>
  );
}

function showSidebarMobile(isOpen) {
  return isOpen ? 'block bg-white/95 backdrop-blur-xl fixed inset-0 z-50 p-8' : 'hidden lg:block';
}

// ---- Sub-components styled in place for brevity & consistency ----

function StatsTab() {
  const { data: stats, isLoading } = useAdminStats();
  if (isLoading) return <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[var(--color-obsidian)]/10 animate-pulse h-48" />;

  const items = [
    { label: "Publiés", value: stats?.memoirs?.total, color: 'text-green-600' },
    { label: "En Attente", value: stats?.memoirs?.pending, color: 'text-[var(--color-cinnabar)]' },
    { label: "Instituts", value: stats?.universities?.total, color: 'text-[var(--color-obsidian)]' },
    { label: "Membres", value: stats?.users?.total, color: 'text-[var(--color-obsidian)]' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-[var(--color-obsidian)]/10 border border-[var(--color-obsidian)]/10">
      {items.map((item, i) => (
        <div key={i} className="bg-[var(--color-base)] p-10 space-y-3">
          <span className="font-mono text-[9px] uppercase tracking-[0.3em] opacity-30">{item.label}</span>
          <p className={`text-4xl font-serif ${item.color}`}>{item.value || 0}</p>
        </div>
      ))}
    </div>
  );
}

function MemoirsTab() {
  const { data: memoirs, isLoading } = usePendingMemoirs();
  if (isLoading) return <p className="font-mono text-[10px] uppercase opacity-20">Scanning Manuscripts...</p>;
  if (!memoirs?.length) return <EmptyState label="Aucun manuscrit en attente d'indexation." />;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between border-b border-[var(--color-obsidian)]/10 pb-6">
         <h3 className="font-serif italic text-2xl">File de Modération</h3>
         <span className="font-mono text-[10px] uppercase tracking-widest opacity-40">{memoirs.length} Documents</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {memoirs.map((memoir) => (
          <MemoirModerationCard key={memoir.public_id} memoir={memoir} />
        ))}
      </div>
    </div>
  );
}

function UniversitiesTab() {
  const { data: universities, isLoading } = usePendingUniversities();
  if (isLoading) return <p className="font-mono text-[10px] uppercase opacity-20">Scanning Institutes...</p>;
  if (!universities?.length) return <EmptyState label="Aucune institution en attente de validation." />;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {universities.map((u) => (
        <UniversityModerationCard key={u.id} university={u} />
      ))}
    </div>
  );
}

function FieldsTab() {
  const { data: fields, isLoading } = usePendingFields();
  const { mutate: updateField } = useUpdateFieldStatus();
  if (isLoading) return <p className="font-mono text-[10px] uppercase opacity-20">Scanning Disciplines...</p>;
  if (!fields?.length) return <EmptyState label="Toutes les disciplines sont validées." />;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {fields.map((f) => (
        <div key={f.id} className="bg-white/50 border border-[var(--color-obsidian)]/10 p-8 space-y-6">
            <div>
              <h3 className="text-xl font-serif text-[var(--color-obsidian)]">{f.label}</h3>
              <p className="font-mono text-[9px] uppercase tracking-widest opacity-30 mt-2">Origine: {f.submitted_by ? `Ref_${f.submitted_by}` : 'System'}</p>
            </div>
            <div className="flex gap-4">
              <Button size="sm" variant="outline" className="flex-1 rounded-none" onClick={() => updateField({ id: f.public_id || f.id, status: 'approved' })}>Valider</Button>
              <Button size="sm" variant="outline" className="flex-1 rounded-none border-[var(--color-cinnabar)]/20 text-[var(--color-cinnabar)]" onClick={() => {
                const reason = window.prompt("Motif de refus ?");
                if (reason) updateField({ id: f.public_id || f.id, status: 'rejected', rejection_reason: reason });
              }}>Rejeter</Button>
            </div>
        </div>
      ))}
    </div>
  );
}

function UsersTab() {
  const { user: currentUser } = useAuth();
  const { data: users, isLoading, refetch } = useQuery({ queryKey: ["admin-users"], queryFn: () => apiClient("/users") });
  const { mutate: updateRole } = useUpdateUserRole();
  const [editingUser, setEditingUser] = useState(null);

  if (isLoading) return <p className="font-mono text-[10px] uppercase opacity-20">Scanning Citizens...</p>;

  return (
    <div className="space-y-8">
      <div className="bg-white/40 border border-[var(--color-obsidian)]/10 overflow-hidden">
        <table className="w-full text-left font-mono text-[10px] uppercase tracking-widest">
          <thead className="border-b border-[var(--color-obsidian)]/10 bg-[var(--color-obsidian)]/5">
            <tr>
              <th className="p-6 opacity-40">Individu</th>
              <th className="p-6 opacity-40">Privilèges</th>
              <th className="p-6 opacity-40 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-obsidian)]/5">
            {users?.map((user) => (
              <tr key={user.id} className="hover:bg-white transition-colors">
                <td className="p-6">
                  <p className="font-serif italic text-lg lowercase opacity-100 tracking-normal">{user.full_name}</p>
                  <p className="opacity-30 mt-1">{user.email}</p>
                </td>
                <td className="p-6">
                  <span className={`px-3 py-1 border ${user.role === 'admin' ? 'border-[var(--color-cinnabar)] text-[var(--color-cinnabar)]' : 'border-[var(--color-obsidian)]/20'}`}>
                    {user.role}
                  </span>
                </td>
                <td className="p-6 text-right">
                  {user.public_id !== currentUser?.public_id ? (
                    <RoleAssigner user={user} onEdit={setEditingUser} />
                  ) : <span className="opacity-20 italic">Soi-même</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editingUser && <RoleEditModal user={editingUser} onClose={() => setEditingUser(null)} onSave={(p) => updateRole(p, { onSuccess: () => refetch() })} />}
    </div>
  );
}

function HistoryTab() {
  const { data: history, isLoading } = useModerationHistory();
  if (isLoading) return <p className="font-mono text-[10px] uppercase opacity-20">Scanning Records...</p>;
  if (!history?.length) return <EmptyState label="Le registre est vierge." />;

  return (
    <div className="grid gap-px bg-[var(--color-obsidian)]/10 border border-[var(--color-obsidian)]/10">
      {history.map((item) => (
        <div key={item.id} className="bg-[var(--color-base)] p-8 flex items-center justify-between group hover:bg-white transition-colors">
          <div className="space-y-2">
            <p className="font-serif italic text-xl">{item.title}</p>
            <div className="flex items-center gap-4 font-mono text-[9px] uppercase tracking-widest opacity-40">
              <span className="text-[var(--color-cinnabar)]">{item.type}</span>
              <span>Modéré par {item.moderator_name}</span>
            </div>
          </div>
          <div className="font-mono text-[10px] uppercase tracking-widest px-4 py-2 border border-[var(--color-obsidian)]/10">
            {item.status}
          </div>
        </div>
      ))}
    </div>
  );
}

function ApplicationsTab() {
  const { data: apps, isLoading } = usePendingApplications();
  const { mutate: updateStatus } = useUpdateApplicationStatus();
  if (isLoading) return <p className="font-mono text-[10px] uppercase opacity-20">Scanning Applications...</p>;
  if (!apps?.length) return <EmptyState label="Aucun nouveau protocole en attente." />;

  return (
    <div className="space-y-8">
      {apps.map((app) => (
        <div key={app.id} className="bg-white/50 border border-[var(--color-obsidian)]/20 p-10 grid grid-cols-1 md:grid-cols-12 gap-12">
          <div className="md:col-span-8 space-y-6">
            <div className="flex items-center gap-4">
              <div className="font-mono text-[9px] uppercase tracking-[0.3em] px-3 py-1 bg-[var(--color-obsidian)] text-white">{app.role}</div>
              <span className="font-mono text-[9px] opacity-30 uppercase tracking-widest">Soumis le {new Date(app.created_at).toLocaleDateString()}</span>
            </div>
            <h3 className="text-4xl font-serif text-[var(--color-obsidian)] leading-none">{app.user_full_name}</h3>
            <p className="text-lg font-light opacity-60 leading-relaxed italic">"{app.motivation}"</p>
            <div className="grid grid-cols-2 gap-8 pt-6 border-t border-[var(--color-obsidian)]/5">
               <div className="space-y-1">
                 <p className="font-mono text-[9px] opacity-30 uppercase tracking-widest">Établissement</p>
                 <p className="font-serif italic text-sm">{app.university_name || app.country_name}</p>
               </div>
               <div className="space-y-1">
                 <p className="font-mono text-[9px] opacity-30 uppercase tracking-widest">Disponibilité</p>
                 <p className="font-serif italic text-sm">{app.availability || 'N/A'} h / Semaine</p>
               </div>
            </div>
          </div>
          <div className="md:col-span-4 flex flex-col justify-center gap-4">
            <Button variant="primary" size="xl" className="rounded-none w-full" onClick={() => updateStatus({ id: app.id, status: 'approved' })}>Approuver</Button>
            <Button variant="outline" size="xl" className="rounded-none w-full border-[var(--color-cinnabar)]/20 text-[var(--color-cinnabar)]" onClick={() => {
              const notes = window.prompt("Motif du refus ?");
              if (notes) updateStatus({ id: app.id, status: 'rejected', admin_notes: notes });
            }}>Rejeter</Button>
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ label }) {
  return (
    <div className="p-24 border border-dashed border-[var(--color-obsidian)]/10 text-center space-y-6">
      <PartyPopper className="w-12 h-12 opacity-10 mx-auto" />
      <p className="font-serif italic text-2xl opacity-40">{label}</p>
    </div>
  );
}
