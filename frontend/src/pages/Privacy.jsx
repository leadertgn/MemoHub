export default function Privacy() {
    return (
        <div className="container mx-auto max-w-4xl py-12 px-4 shadow-sm bg-white rounded-2xl mt-8 mb-20 border border-gray-100">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-6">Politique de Confidentialité</h1>
            <div className="prose prose-blue max-w-none text-gray-700 space-y-4">
                <p>Chez MemoHub, la protection de vos données personnelles est primordiale.</p>
                
                <h2 className="text-xl font-bold text-gray-800 mt-6">1. Données collectées</h2>
                <p>Lorsque vous vous connectez (notamment via Google OAuth), nous collectons uniquement les données strictement nécessaires :</p>
                <ul className="list-disc pl-6 space-y-1">
                    <li>Votre adresse e-mail.</li>
                    <li>Votre nom et prénom complet (pour la facturation ou la paternité des œuvres).</li>
                    <li>Votre photo de profil (avatar Google).</li>
                </ul>

                <h2 className="text-xl font-bold text-gray-800 mt-6">2. Utilisation des données</h2>
                <p>Vos données servent exclusivement à :</p>
                <ul className="list-disc pl-6 space-y-1">
                    <li>Vous identifier de manière unique sur la plateforme.</li>
                    <li>Vous attribuer la paternité ou le suivi des documents suggérés.</li>
                    <li>Gérer vos rôles (Étudiant, Ambassadeur, Modérateur).</li>
                </ul>
                <p><strong>Nous ne vendons ni ne partageons vos données personnelles avec des tiers à des fins commerciales.</strong></p>

                <h2 className="text-xl font-bold text-gray-800 mt-6">3. Sécurité</h2>
                <p>Vos communications avec le serveur sont sécurisées via HTTPS, et votre authentification repose sur le système robuste de Google Identity Services. Nous ne stockons en base de données aucun mot de passe vous concernant.</p>

                <h2 className="text-xl font-bold text-gray-800 mt-6">4. Vos droits d'accès</h2>
                <p>Conformément aux directives internationales sur la protection des données, vous avez le droit de consulter, modifier ou demander la suppression intégrale de vos informations en nous contactant.</p>
            </div>
        </div>
    )
}
