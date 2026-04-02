import sys
import httpx
from sqlmodel import Session, select, SQLModel
from app.database import engine, create_db_and_tables
from app.models import Country, Domain, University, FieldOfStudy
from app.models.enums import UniversityStatus


def seed_countries(session: Session):
    """
    Charge tous les pays depuis restcountries.com une seule fois.
    Si l'API échoue, on a un fallback avec les pays africains essentiels.
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

    try:
        print("  Tentative de chargement depuis restcountries.com...")
        response = httpx.get(
            "https://restcountries.com/v3.1/all?fields=name,cca3",
            timeout=10.0
        )
        response.raise_for_status()
        data = response.json()

        for country in data:
            countries_to_add.append({
                "name": country["name"]["common"],
                "iso_code": country["cca3"]
            })

        print(f"  ✅ {len(countries_to_add)} pays récupérés depuis l'API")

    except Exception as e:
        print(f"  ⚠️  API indisponible ({e})")
        print(f"  ↩️  Utilisation du fallback ({len(fallback_countries)} pays)")
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


def seed_insti(session: Session):
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
    insti_name = "Institut National Supérieur de Technologie Industrielle (INSTI)"
    insti = session.exec(
        select(University).where(University.name == insti_name)
    ).first()

    if not insti:
        insti = University(
            name=insti_name,
            country_id=benin.id,
            website="https://unstim.bj/insti",
            status=UniversityStatus.approved
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
                label=label,
                university_id=insti.id,
                domain_id=domain.id
            ))
            added += 1

    print(f"  ✅ {added} filières INSTI ajoutées")


def seed_data():
    reset_mode = "--reset" in sys.argv

    if reset_mode:
        print("🧨 MODE RESET ACTIVÉ : Suppression de toutes les données existantes...")
        
        # Astuce pour contourner l'erreur de "Circular Dependency" causée par les Foreign Keys
        if engine.name == "postgresql":
            from sqlalchemy import text
            with engine.begin() as conn:
                conn.execute(text("DROP SCHEMA public CASCADE;"))
                conn.execute(text("CREATE SCHEMA public;"))
            print("✅ Schéma PostgreSQL purgé en mode CASCADE.")
        elif getattr(engine, "name", "").startswith("sqlite"):
            import os
            # Le chemin d'un URL SQLite ressemble à "sqlite:///memo.db"
            db_path = str(engine.url).replace("sqlite:///", "")
            if os.path.exists(db_path):
                os.remove(db_path)
                print(f"✅ Fichier SQLite '{db_path}' supprimé.")
            else:
                print(f"⚠️ Fichier SQLite introuvable : {db_path} (peut-être déjà supprimé)")
        else:
            SQLModel.metadata.drop_all(engine)
            print("✅ Base de données purgée standard.")

    print("🔧 Création et Vérification des tables...")
    create_db_and_tables()

    with Session(engine) as session:
        seed_countries(session)
        seed_domains(session)
        seed_insti(session)
        session.commit()

    print("\n🚀 Seed terminé avec succès !")


if __name__ == "__main__":
    seed_data()