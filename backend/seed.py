import argparse
import sys
import httpx
from sqlmodel import Session, select, SQLModel
from app.database import engine, create_db_and_tables
from app.models import Country, Domain, University, FieldOfStudy, User
from app.models.enums import UniversityStatus, UserRole


def seed_countries(session: Session, api_data: list):
    """
    Charge tous les pays à partir des données pré-téléchargées.
    Si l'API a échoué, on utilise un fallback avec les pays africains essentiels.
    """
    print("\n🌍 Peuplement des pays...")

    fallback_countries = [
        {"name": "Bénin", "iso_code": "BEN"},
        {"name": "Sénégal", "iso_code": "SEN"},
        {"name": "Togo", "iso_code": "TGO"},
        {"name": "Côte d'Ivoire", "iso_code": "CIV"},
        {"name": "Cameroun", "iso_code": "CMR"},
        {"name": "Mali", "iso_code": "MLI"},
        {"name": "Burkina Faso", "iso_code": "BFA"},
        {"name": "Niger", "iso_code": "NER"},
        {"name": "Ghana", "iso_code": "GHA"},
        {"name": "Nigeria", "iso_code": "NGA"},
        {"name": "France", "iso_code": "FRA"},
        {"name": "Maroc", "iso_code": "MAR"},
    ]

    countries_to_add = []

    if api_data:
        for country in api_data:
            countries_to_add.append({
                "name": country["name"]["common"],
                "iso_code": country["cca3"]
            })
        print(f"  ✅ {len(countries_to_add)} pays en préparation")
    else:
        print("  ↩️  Utilisation du fallback (données par défaut)")
        countries_to_add = fallback_countries

    added = 0
    for c_data in countries_to_add:
        existing = session.exec(
            select(Country).where(Country.iso_code == c_data["iso_code"])
        ).first()
        if not existing:
            session.add(Country(**c_data))
            added += 1

    print(f"  ✅ {added} nouveaux pays ajoutés en base")


def seed_domains(session: Session):
    """Domaines académiques normalisés — gérés manuellement."""
    print("\n📚 Peuplement des domaines...")

    domains_to_add = [
        {"label": "Informatique & Numérique", "description": "Génie logiciel, IA, réseaux, systèmes"},
        {"label": "Électronique, Robotique & IoT",
         "description": "Électronique embarquée, robotique, objets connectés"},
        {"label": "Génie Électrique & Énergie",
         "description": "Électrotechnique, énergies renouvelables, froid et climatisation"},
        {"label": "Génie Civil & Construction", "description": "BTP, urbanisme, infrastructure, géomatique"},
        {"label": "Génie Mécanique & Industriel", "description": "Mécanique, maintenance industrielle, productique"},
        {"label": "Droit & Sciences Juridiques", "description": "Droit public, privé, international"},
        {"label": "Économie & Gestion", "description": "Finance, management, comptabilité"},
        {"label": "Médecine & Sciences de la Santé", "description": "Médecine, pharmacie, santé publique"},
        {"label": "Sciences de l'Éducation", "description": "Pédagogie, formation, didactique"},
        {"label": "Lettres & Sciences Humaines", "description": "Philosophie, histoire, sociologie"},
        {"label": "Agriculture & Environnement", "description": "Agronomie, écologie, ressources naturelles"},
    ]

    added = 0
    for d_data in domains_to_add:
        existing = session.exec(
            select(Domain).where(Domain.label == d_data["label"])
        ).first()
        if not existing:
            session.add(Domain(**d_data))
            added += 1

    print(f"  ✅ {added} nouveaux domaines ajoutés en base")
    session.flush()  # pour que les IDs soient disponibles


def seed_insti(session: Session, admin_id: int | None = None):
    """
    Seed de l'INSTI (Institut National Supérieur de Technologie Industrielle)
    rattaché à l'UNSTIM - Abomey, Bénin.

    Source : Guide d'orientation universitaire 2024-2025, page 43-45
    """
    print("\n🏫 Seed INSTI (UNSTIM)...")

    # 1. Récupère le Bénin
    benin = session.exec(
        select(Country).where(Country.iso_code == "BEN")
    ).first()
    if not benin:
        print("  ❌ Bénin introuvable — lance d'abord seed_countries()")
        return

    # 2. Crée l'INSTI directement comme une Université autonome
    insti_name = "Institut National Supérieur de Technologie Industrielle (INSTI)".upper()
    insti_acronym = "INSTI"
    
    insti = session.exec(
        select(University).where(University.name == insti_name)
    ).first()

    if not insti:
        insti = University(
            name=insti_name,
            acronym=insti_acronym,
            country_id=benin.id,
            website="https://unstim.bj/insti",
            status=UniversityStatus.approved,
            submitted_by=admin_id,
            moderated_by=admin_id
        )
        session.add(insti)
        session.flush()
        print("  ✅ INSTI (Loco) créée")
    else:
        print("  ℹ️  INSTI déjà présente")

    # 3. Helper pour récupérer un domaine
    def get_domain(label):
        return session.exec(
            select(Domain).where(Domain.label == label)
        ).first()

    # 4. Filières de l'INSTI selon le guide officiel 2024-2025 (pages 43-45)
    # Format : (label exact selon le guide, domaine normalisé)
    fields_to_add = [
        # --- Génie Civil ---
        (
            "Génie Civil",
            "Génie Civil & Construction",
            "Techniciens de travaux, experts géomètres, cabinets d'architecture"
        ),
        # --- Génie Électrique & Informatique ---
        (
            "Génie Électrique et Informatique (Informatique et Télécommunications)",
            "Informatique & Numérique",
            "Service informatique d'entreprise, maintenance informatique, développement d'applications"
        ),
        (
            "Génie Électrique et Informatique (Électronique et Électrotechnique)",
            "Génie Électrique & Énergie",
            "Électricité industrielle, commande automatique, contrôle qualité"
        ),
        # --- Génie Énergétique ---
        (
            "Génie Énergétique (Énergies Renouvelables et Systèmes Énergétiques)",
            "Génie Électrique & Énergie",
            "Techniciens en industrie électrique, bâtiment, énergies renouvelables"
        ),
        (
            "Génie Énergétique (Froid et Climatisation)",
            "Génie Électrique & Énergie",
            "Techniciens en froid et climatisation de bâtiment et automobile"
        ),
        # --- Génie Mécanique ---
        (
            "Génie Mécanique et Productique",
            "Génie Mécanique & Industriel",
            "Maintenance industrielle, fabrication mécanique, mécanisation agricole"
        ),
        (
            "Maintenance des Systèmes (Maintenance Industrielle)",
            "Génie Mécanique & Industriel",
            "Techniciens des industries de transformation, auditeurs/conseils"
        ),
        (
            "Maintenance des Systèmes (Maintenance Automobile)",
            "Génie Mécanique & Industriel",
            "Parcs automobiles, concessionnaires, usines de production"
        ),
    ]

    added = 0
    for label, domain_label, _ in fields_to_add:
        domain = get_domain(domain_label)
        if not domain:
            print(f"  ⚠️  Domaine '{domain_label}' introuvable — ignoré")
            continue

        existing = session.exec(
            select(FieldOfStudy).where(
                FieldOfStudy.label == label,
                FieldOfStudy.university_id == insti.id
            )
        ).first()

        if not existing:
            session.add(FieldOfStudy(
                label=label.title(),
                university_id=insti.id,
                domain_id=domain.id,
                submitted_by=admin_id,
                moderated_by=admin_id
            ))
            added += 1

    print(f"  ✅ {added} filières INSTI ajoutées")


def seed_data():
    parser = argparse.ArgumentParser(description="Peupler la base de données MemoHub")
    parser.add_argument("--reset", action="store_true", help="Supprime toutes les données avant de commencer")
    parser.add_argument("--admin-email", type=str, help="L'email du compte admin qui sera désigné comme auteur du seed")
    args = parser.parse_args()

    if args.reset:
        print("🧨 MODE RESET ACTIVÉ : Suppression de toutes les données existantes...")
        
        # Astuce contournement circular dependency Foreign Keys
        if engine.name == "postgresql":
            from sqlalchemy import text
            with engine.begin() as conn:
                conn.execute(text("DROP SCHEMA public CASCADE;"))
                conn.execute(text("CREATE SCHEMA public;"))
            print("✅ Schéma PostgreSQL purgé en mode CASCADE.")
        elif getattr(engine, "name", "").startswith("sqlite"):
            import os
            db_path = str(engine.url).replace("sqlite:///", "")
            if os.path.exists(db_path):
                os.remove(db_path)
                print(f"✅ Fichier SQLite '{db_path}' supprimé.")
        else:
            SQLModel.metadata.drop_all(engine)
            print("✅ Base de données purgée standard.")

    print("🔧 Création et Vérification des tables...")
    create_db_and_tables()

    # 1. On télécharge la volumineuse API AVANT d'ouvrir une session SQL 
    # (Neon ferme agressivement les connexions inactives)
    api_data = None
    try:
        print("\n🌍 Préchauffage HTTP : chargement depuis restcountries.com...")
        response = httpx.get("https://restcountries.com/v3.1/all?fields=name,cca3", timeout=10.0)
        response.raise_for_status()
        api_data = response.json()
        print("  ✅ Téléchargement API terminé avec succès.")
    except Exception as e:
        print(f"  ⚠️  API indisponible ({e}) - Nous utiliserons le fallback.")

    with Session(engine) as session:
        # Recherche du compte Admin si spécifié
        admin_id = None
        if args.admin_email:
            admin_user = session.exec(select(User).where(User.email == args.admin_email)).first()
            if admin_user:
                admin_id = admin_user.id
                print(f"👑 Utilisateur trouvé : {admin_user.full_name} ({admin_user.email})")
                
                # Vérification stricte du rôle
                if admin_user.role != UserRole.admin:
                    print(f"❌ ERREUR: Cet utilisateur n'a pas le rôle 'admin'.")
                    print(f"💡 Astuce : Allez dans l'interface de NeonDB, trouvez l'utilisateur et changez son rôle à 'admin' avant de lancer le seed.")
                    sys.exit(1)
                    
                print("✅ Rôle administrateur confirmé.")
            else:
                print(f"⚠️ Email {args.admin_email} introuvable en DB. Connectez-vous d'abord à l'application.")
                print(f"❌ Arrêt du seed (l'Auteur Administrateur est requis).")
                sys.exit(1)

        seed_countries(session, api_data=api_data)
        seed_domains(session)
        seed_insti(session, admin_id=admin_id)
        session.commit()

    print("\n🚀 Seed terminé avec succès !")


if __name__ == "__main__":
    seed_data()