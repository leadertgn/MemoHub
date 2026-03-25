import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '../api/client'

export default function Home() {
  // Stats depuis l'API
  const { data: stats } = useQuery({
    queryKey: ['stats'],
    queryFn: () => apiClient('/admin/stats'),
    // Ne bloque pas le rendu si ça échoue
    retry: false,
  })

  return (
    <div className="space-y-16">

      {/* Hero */}
      <section className="text-center py-16 space-y-6">
        <h1 className="text-4xl font-bold text-gray-900 leading-tight">
          La bibliothèque des mémoires<br />
          <span className="text-blue-600">académiques du Bénin</span>
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Accédez aux mémoires de licence, master et doctorat.
          Trouvez l'inspiration pour vos travaux de recherche.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            to="/search"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Rechercher un mémoire
          </Link>
          <Link
            to="/upload"
            className="border border-blue-600 text-blue-600 px-8 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors"
          >
            Contribuer
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            label: "Mémoires disponibles",
            value: stats?.memoirs?.total ?? '—',
            icon: "📄",
            color: "blue"
          },
          {
            label: "Universités référencées",
            value: stats?.universities?.total ?? '—',
            icon: "🏛️",
            color: "green"
          },
          {
            label: "En attente de validation",
            value: stats?.memoirs?.pending ?? '—',
            icon: "⏳",
            color: "orange"
          },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center">
            <div className="text-3xl mb-2">{stat.icon}</div>
            <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
          </div>
        ))}
      </section>

      {/* Comment ça marche */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 text-center">Comment ça marche ?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              step: "1",
              title: "Recherchez",
              desc: "Filtrez par filière, université, année ou niveau d'étude"
            },
            {
              step: "2",
              title: "Consultez",
              desc: "Lisez les mémoires en ligne directement dans votre navigateur"
            },
            {
              step: "3",
              title: "Contribuez",
              desc: "Partagez votre mémoire pour aider les prochaines générations"
            },
          ].map((item) => (
            <div key={item.step} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm mb-4">
                {item.step}
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-sm text-gray-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  )
}