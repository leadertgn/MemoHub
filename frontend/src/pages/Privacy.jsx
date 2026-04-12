export default function Privacy() {
    return (
        <div className="min-h-screen bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="container mx-auto max-w-4xl">
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Header avec dégradé subtil */}
                    <div className="bg-linear-to-r from-teal-600 to-blue-600 px-8 py-10 text-white">
                        <h1 className="text-3xl font-extrabold tracking-tight">Politique de Confidentialité</h1>
                        <p className="mt-2 text-teal-50 opacity-90">Conformité RGPD & Protection des Données</p>
                    </div>

                    <div className="p-8 sm:p-12 prose prose-slate max-w-none">
                        <p className="text-lg text-gray-600 leading-relaxed">
                            Chez <strong>MemoHub</strong>, nous prenons la protection de vos données personnelles très au sérieux. Cette politique détaille comment nous collectons, utilisons et protégeons vos informations lors de votre utilisation de notre bibliothèque numérique.
                        </p>

                        <div className="space-y-10 mt-10">
                            <section>
                                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                                    <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-teal-50 text-teal-600 text-sm">01</span>
                                    Responsable du Traitement
                                </h2>
                                <p>
                                    Le responsable du traitement des données est l'équipe d'administration de MemoHub. Pour toute question relative à vos données, vous pouvez nous contacter via l'adresse dédiée à la protection des données.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                                    <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-teal-50 text-teal-600 text-sm">02</span>
                                    Données Collectées et Finalité
                                </h2>
                                <p>
                                    Nous collectons uniquement les données strictement nécessaires au bon fonctionnement du service (principe de minimisation) :
                                </p>
                                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                                    <li><strong>Identité :</strong> Nom, prénom et adresse e-mail (via Google OAuth) pour l'authentification et l'attribution des travaux.</li>
                                    <li><strong>Profil académique :</strong> Université et filière d'attachement pour le référencement documentaire.</li>
                                    <li><strong>Données techniques :</strong> Adresses IP et logs de connexion à des fins de sécurité et de prévention des abus.</li>
                                </ul>
                                <p className="mt-4 font-medium text-gray-900">Finalités :</p>
                                <p>L'accès au service, la sécurisation des soumissions, et la gestion des rôles (Ambassadeur, Modérateur).</p>
                            </section>

                            <section>
                                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                                    <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-teal-50 text-teal-600 text-sm">03</span>
                                    Base Légale du Traitement
                                </h2>
                                <p>
                                    Le traitement de vos données repose sur votre <strong>consentement</strong> explicite (exprimé lors de la connexion via Google) et sur l'<strong>intérêt légitime</strong> de MemoHub à assurer la sécurité et l'intégrité de sa base de données académique.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                                    <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-teal-50 text-teal-600 text-sm">04</span>
                                    Conservation et Destinataires
                                </h2>
                                <p>
                                    <strong>Durée :</strong> Vos données de profil sont conservées tant que votre compte est actif. En cas d'inactivité prolongée (supérieure à 3 ans), vos données personnelles identifiantes sont supprimées ou anonymisées.
                                </p>
                                <p>
                                    <strong>Destinataires :</strong> Vos données ne sont jamais vendues à des tiers. Elles ne sont accessibles qu'aux administrateurs de la plateforme et, pour les besoins techniques, à nos prestataires d'infrastructure (hébergement).
                                </p>
                            </section>

                            <section>
                                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                                    <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-teal-50 text-teal-600 text-sm">05</span>
                                    Vos Droits (RGPD)
                                </h2>
                                <p>
                                    Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez des droits suivants :
                                </p>
                                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                                    <li>Droit d'accès et de rectification.</li>
                                    <li>Droit à l'effacement (« droit à l'oubli »).</li>
                                    <li>Droit à la limitation du traitement.</li>
                                    <li>Droit à la portabilité de vos données.</li>
                                </ul>
                                <p>Pour exercer ces droits, contactez-nous par e-mail.</p>
                            </section>

                            <section className="pt-8 border-t border-gray-100">
                                <h2 className="text-xl font-bold text-gray-900">Sécurité</h2>
                                <p>
                                    MemoHub utilise des protocoles de chiffrement standards (SSL/TLS) pour protéger vos données lors des transferts. Aucun mot de passe n'est stocké localement sur nos serveurs.
                                </p>
                            </section>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
