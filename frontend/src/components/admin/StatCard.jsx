export default function StatCard({ label, value, icon: Icon, color = 'blue' }) {
  const colors = {
    blue:   'bg-blue-50 text-blue-600',
    green:  'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
    purple: 'bg-purple-50 text-purple-600',
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors[color]}`}>
        {Icon && <Icon className="w-6 h-6" />}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value ?? '—'}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  )
}