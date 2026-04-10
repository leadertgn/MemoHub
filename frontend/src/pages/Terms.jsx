export default function Terms() {
    return (
        <div className="min-h-screen bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="container mx-auto max-w-4xl">
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Header avec dégradé subtil */}
                    <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-8 py-10 text-white">
                        <h1 className="text-3xl font-extrabold tracking-tight">Conditions Générales d'Utilisation</h1>
                        <p className="mt-2 text-indigo-100 opacity-90">Dernière mise à jour : 10 Avril 2026</p>
                    </div>

                    <div className="p-8 sm:p-12 prose prose-slate max-w-none">
                        <p className="text-lg text-gray-600 leading-relaxed">
                            Bienvenue sur <strong>MemoHub</strong>. Les présentes Conditions Générales d'Utilisation (CGU) encadrent l'accès et l'utilisation de notre plateforme académique numérique. En accédant au service, vous acceptez sans réserve ces termes.
                        </p>

                        <div className="space-y-10 mt-10">
                            <section>
                                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                                    <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 text-sm">01</span>
                                    Objet du Service
                                </h2>
                                <p>
                                    MemoHub est un portail décentralisé dédié à la préservation et à la diffusion du savoir académique. Il permet aux étudiants de soumettre leurs travaux de fin d'études et à la communauté de les consulter gratuitement dans un cadre de recherche et d'éducation.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                                    <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 text-sm">02</span>
                                    Propriété Intellectuelle et Licence
                                </h2>
                                <p>
                                    <strong>Droits d'Auteur :</strong> L'étudiant (ou l'auteur original) conserve l'intégralité de ses droits d'auteur sur les documents soumis.
                                </p>
                                <p>
                                    <strong>Licence de Diffusion :</strong> En soumettant un document sur MemoHub, l'Utilisateur concède à la plateforme une licence mondiale, non-exclusive et gratuite de reproduire, diffuser et afficher l'œuvre sur le portail. Cette licence inclut le droit pour MemoHub d'apposer des marquages techniques (filigranes) pour assurer la traçabilité du document.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                                    <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 text-sm">03</span>
                                    Responsabilité de l'Utilisateur
                                </h2>
                                <p>
                                    L'Utilisateur est seul responsable des documents qu'il publie. Il garantit qu'il détient tous les droits nécessaires (accord de l'établissement, des co-auteurs, etc.) et que son travail ne constitue pas un plagiat.
                                </p>
                                <div className="bg-amber-50 border-l-4 border-amber-400 p-4 my-4">
                                    <p className="text-amber-700 text-sm">
                                        <strong>Attention :</strong> Toute violation avérée du droit d'auteur ou signalement de plagiat entraînera le retrait immédiat du document et pourra conduire à la suspension définitive du compte utilisateur.
                                    </p>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                                    <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 text-sm">04</span>
                                    Modération et Administration
                                </h2>
                                <p>
                                    MemoHub s'appuie sur un système de modération multi-niveaux (Ambassadeurs, Modérateurs, Admins). L'administration se réserve le droit discrétionnaire de refuser toute publication ne respectant pas les standards académiques ou la charte graphique de la plateforme.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                                    <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 text-sm">05</span>
                                    Limitation de Responsabilité
                                </h2>
                                <p>
                                    MemoHub agit en tant qu'hébergeur technique. La plateforme ne saurait être tenue responsable de l'exactitude des informations contenues dans les travaux de recherche publiés, ni des conséquences de leur utilisation par des tiers.
                                </p>
                            </section>

                            <section className="pt-8 border-t border-gray-100">
                                <h2 className="text-xl font-bold text-gray-900">Contact Juridique</h2>
                                <p>
                                    Pour tout signalement relatif à la propriété intellectuelle (DMCA/Droit d'Auteur), veuillez nous contacter à l'adresse suivante : <span className="text-indigo-600 font-medium">legal@memohub.com</span>.
                                </p>
                            </section>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
