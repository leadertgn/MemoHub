import { useState, useEffect } from "react";
import { apiClient } from "../../api/client";
import { toast } from "sonner";
import { Globe, Building2, X } from "lucide-react";

export default function RoleEditModal({ user, onClose, onSave }) {
  const [selectedRole, setSelectedRole] = useState(user.role);
  const [countries, setCountries] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(
    user.country_id?.toString() || "",
  );
  const [selectedUniversity, setSelectedUniversity] = useState(
    user.university_id?.toString() || "",
  );

  useEffect(() => {
    // Charger les données au montage
    apiClient("/countries").then(setCountries);
    apiClient("/universities").then(setUniversities);
  }, []);

  const handleSave = () => {
    if (selectedRole === "moderator" && !selectedCountry) {
      toast.error("Veuillez sélectionner un pays.");
      return;
    }
    if (selectedRole === "ambassador" && !selectedUniversity) {
      toast.error("Veuillez sélectionner une université.");
      return;
    }

    const payload = { id: user.id, role: selectedRole };
    if (selectedRole === "moderator") {
      payload.country_id = parseInt(selectedCountry);
    }
    if (selectedRole === "ambassador") {
      payload.university_id = parseInt(selectedUniversity);
    }

    onSave(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Modifier le rôle
            </h2>
            <p className="text-sm text-gray-500">{user.full_name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Sélecteur de rôle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nouveau rôle
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="student">student</option>
              <option value="ambassador">ambassador</option>
              <option value="moderator">moderator</option>
              <option value="admin">admin</option>
            </select>
          </div>

          {/* Options pour moderator */}
          {selectedRole === "moderator" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Globe className="w-4 h-4 text-gray-400" />
                Pays de juridiction
              </label>
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Sélectionner un pays...</option>
                {countries.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Options pour ambassador */}
          {selectedRole === "ambassador" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-gray-400" />
                Université de rattachement
              </label>
              <select
                value={selectedUniversity}
                onChange={(e) => setSelectedUniversity(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Sélectionner une université...</option>
                {universities.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}
