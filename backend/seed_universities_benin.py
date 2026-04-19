"""
Seed des universités et filières du Bénin
Source : Guide d'Orientation Universitaire 2024-2025 (Licence)
Ministère de l'Enseignement Supérieur et de la Recherche Scientifique - République du Bénin

Structure couverte :
  I.   Université d'Abomey-Calavi (UAC)         — 26 établissements/facultés
  II.  Université de Parakou (UP)                — 9 établissements/facultés
  III. UNSTIM (Abomey)                           — 8 établissements/écoles
  IV.  Université Nationale d'Agriculture (UNA)  — 9 écoles
  V.   Institut Universitaire d'Enseignement Professionnel (IUEP)
  VI.  Sèmè City (EPITECH)
"""

from sqlmodel import Session, select
from sqlalchemy import func
from app.database import engine
from app.models import Country, Domain, University, FieldOfStudy
from app.models.enums import UniversityStatus, FieldStatus


# ─────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────

def get_or_none(session, model, **kwargs):
    """Retourne le premier objet correspondant ou None."""
    conditions = [getattr(model, k) == v for k, v in kwargs.items()]
    stmt = select(model)
    for c in conditions:
        stmt = stmt.where(c)
    return session.exec(stmt).first()


def get_domain(session, label):
    d = get_or_none(session, Domain, label=label)
    if not d:
        raise ValueError(f"Domaine introuvable : '{label}' — vérifiez seed_domains()")
    return d


def upsert_university(session, *, name, acronym, country_id, website=None, admin_id=None):
    """
    Crée l'université si absente (par nom normalisé en majuscules).
    Retourne l'objet University.
    """
    name_upper = name.strip().upper()
    existing = session.exec(
        select(University).where(func.upper(University.name) == name_upper)
    ).first()
    if existing:
        return existing

    univ = University(
        name=name_upper,
        acronym=acronym.upper() if acronym else None,
        country_id=country_id,
        website=website,
        status=UniversityStatus.approved,
        submitted_by=admin_id,
        moderated_by=admin_id,
    )
    session.add(univ)
    session.flush()  # obtenir l'id avant d'insérer les filières
    print(f"    🏫 Université créée : {name_upper}")
    return univ


def upsert_field(session, *, label, university_id, domain_id, admin_id=None):
    """
    Crée la filière si absente dans cette université.
    """
    label_title = label.strip().title()
    existing = session.exec(
        select(FieldOfStudy).where(
            func.upper(FieldOfStudy.label) == label_title.upper(),
            FieldOfStudy.university_id == university_id,
        )
    ).first()
    if existing:
        return existing

    field = FieldOfStudy(
        label=label_title,
        university_id=university_id,
        domain_id=domain_id,
        status=FieldStatus.approved,
        submitted_by=admin_id,
        moderated_by=admin_id,
    )
    session.add(field)
    return field


# ─────────────────────────────────────────────────────────────
# I — Université d'Abomey-Calavi (UAC)
# ─────────────────────────────────────────────────────────────

def seed_uac(session, country_id, admin_id=None):
    print("\n📘 Seed UAC — Université d'Abomey-Calavi...")

    # Domaines nécessaires (correspondance avec seed_domains)
    d_info      = get_domain(session, "Informatique & Numérique")
    d_elec      = get_domain(session, "Génie Électrique & Énergie")
    d_civil     = get_domain(session, "Génie Civil & Construction")
    d_meca      = get_domain(session, "Génie Mécanique & Industriel")
    d_sante     = get_domain(session, "Médecine & Sciences de la Santé")
    d_droit     = get_domain(session, "Droit & Sciences Juridiques")
    d_eco       = get_domain(session, "Économie & Gestion")
    d_edu       = get_domain(session, "Sciences de l'Éducation")
    d_lettres   = get_domain(session, "Lettres & Sciences Humaines")
    d_agri      = get_domain(session, "Agriculture & Environnement")
    d_iot       = get_domain(session, "Électronique, Robotique & IoT")

    # ── 1. IRSP ──────────────────────────────────────────────
    irsp = upsert_university(session,
        name="Institut Régional de Santé Publique",
        acronym="IRSP", country_id=country_id, admin_id=admin_id,
        website="https://www.uac.bj")
    upsert_field(session, label="Santé Publique Polyvalente",
                 university_id=irsp.id, domain_id=d_sante.id, admin_id=admin_id)

    # ── 2. FLASH-Adjarra ─────────────────────────────────────
    flash_adj = upsert_university(session,
        name="Faculté des Lettres, Arts et Sciences Humaines d'Adjarra (FLASH-Adjarra)",
        acronym="FLASH-Adjarra", country_id=country_id, admin_id=admin_id)
    for label, dom in [
        ("Géographie et Aménagement du Territoire", d_lettres),
        ("Socio-Anthropologie",                     d_lettres),
        ("Anglais",                                 d_lettres),
    ]:
        upsert_field(session, label=label, university_id=flash_adj.id,
                     domain_id=dom.id, admin_id=admin_id)

    # ── 3. IMSP ──────────────────────────────────────────────
    imsp = upsert_university(session,
        name="Institut de Mathématiques et de Sciences Physiques",
        acronym="IMSP", country_id=country_id, admin_id=admin_id)
    upsert_field(session,
        label="Classes Préparatoires Mathématiques, Physiques et Science de l'Ingénieur (MPSI/PCSI)",
        university_id=imsp.id, domain_id=d_info.id, admin_id=admin_id)

    # ── 4. FLLAC ─────────────────────────────────────────────
    fllac = upsert_university(session,
        name="Faculté des Lettres, Langues, Arts et Communications",
        acronym="FLLAC", country_id=country_id, admin_id=admin_id)
    for label in ["Allemand", "Anglais", "Espagnol", "Lettres Modernes",
                  "Sciences du Langage et de la Communication"]:
        upsert_field(session, label=label, university_id=fllac.id,
                     domain_id=d_lettres.id, admin_id=admin_id)

    # ── 5. INMAAC ────────────────────────────────────────────
    inmaac = upsert_university(session,
        name="Institut National des Métiers d'Arts, d'Archéologie et de la Culture",
        acronym="INMAAC", country_id=country_id, admin_id=admin_id)
    for label in ["Administration Culturelle", "Arts Dramatiques",
                  "Arts Plastiques", "Musique et Musicologie", "Cinéma et Audiovisuel"]:
        upsert_field(session, label=label, university_id=inmaac.id,
                     domain_id=d_edu.id, admin_id=admin_id)

    # ── 6. CIFRED ────────────────────────────────────────────
    cifred = upsert_university(session,
        name="Centre Inter Facultaire de Formation et de Recherche en Environnement pour le Développement Durable",
        acronym="CIFRED", country_id=country_id, admin_id=admin_id)
    for label in ["Environnement, Hygiène et Santé Publique", "Gestion du Cadre de Vie",
                  "Gestion des Changements Climatiques et des Écosystèmes",
                  "Géomatique et Environnement",
                  "Planification et Gestion des Espaces Urbains et Ruraux"]:
        upsert_field(session, label=label, university_id=cifred.id,
                     domain_id=d_agri.id, admin_id=admin_id)

    # ── 7. IGATE (Institut de Cadre de Vie) ──────────────────
    igate = upsert_university(session,
        name="Institut de Cadre de Vie (Ex. IGATE)",
        acronym="IGATE", country_id=country_id, admin_id=admin_id)
    for label in ["Géographie et Aménagement du Territoire",
                  "Planification et Gestion des Espaces Urbains et Ruraux",
                  "Géomatique et Environnement"]:
        upsert_field(session, label=label, university_id=igate.id,
                     domain_id=d_civil.id, admin_id=admin_id)

    # ── 8. INMeS ─────────────────────────────────────────────
    inmes = upsert_university(session,
        name="Institut National Médico-Sanitaire",
        acronym="INMeS", country_id=country_id, admin_id=admin_id)
    for label in ["Sciences Infirmières", "Sciences Obstétricales"]:
        upsert_field(session, label=label, university_id=inmes.id,
                     domain_id=d_sante.id, admin_id=admin_id)

    # ── 9. INE ───────────────────────────────────────────────
    ine = upsert_university(session,
        name="Institut National de l'Eau",
        acronym="INE", country_id=country_id, admin_id=admin_id)
    for label in [
        "Hydrologie Quantitative et Gestion Intégrée des Ressources",
        "Hydrogéologie et Gestion Intégrée des Ressources",
        "Écohydrologie et Gestion Intégrée des Ressources",
        "Gestion des Crises et Risques Liés à l'Eau et au Climat",
        "Génie Rural et Maîtrise de l'Eau",
        "Hydraulique et Assainissement",
        "Eau Hygiène et Assainissement",
    ]:
        upsert_field(session, label=label, university_id=ine.id,
                     domain_id=d_civil.id, admin_id=admin_id)

    # ── 10. ENEAM ────────────────────────────────────────────
    eneam = upsert_university(session,
        name="École Nationale d'Économie Appliquée et de Management",
        acronym="ENEAM", country_id=country_id, admin_id=admin_id)
    for label, dom in [
        ("Administration des Réseaux Informatiques", d_info),
        ("Analyse Informatique et Programmation",    d_info),
        ("Assurance",                               d_eco),
        ("Banque et Finance de Marché",             d_eco),
        ("Banque et Institutions des Microfinances", d_eco),
        ("Marketing",                               d_eco),
        ("Gestion des Ressources Humaines",         d_eco),
        ("Gestion des Transports",                  d_eco),
        ("Gestion de Logistique",                   d_eco),
        ("Statistique Économique et Sectorielle",   d_eco),
        ("Statistique Démographique et Sociale",    d_eco),
        ("Planification et Gestion des Projets",    d_eco),
        ("Planification et Économie du Développement Durable", d_eco),
        ("Développement Local et Régional",         d_eco),
        ("Gestion Financière et Comptable",         d_eco),
    ]:
        upsert_field(session, label=label, university_id=eneam.id,
                     domain_id=dom.id, admin_id=admin_id)

    # ── 11. EPA ───────────────────────────────────────────────
    epa = upsert_university(session,
        name="École du Patrimoine Africain",
        acronym="EPA", country_id=country_id, admin_id=admin_id)
    upsert_field(session, label="Gestion du Patrimoine Culturel",
                 university_id=epa.id, domain_id=d_lettres.id, admin_id=admin_id)

    # ── 12. FASHS-Calavi ─────────────────────────────────────
    fashs = upsert_university(session,
        name="Faculté des Sciences Humaines et Sociales de Calavi",
        acronym="FASHS", country_id=country_id, admin_id=admin_id)
    for label, dom in [
        ("Géographie et Aménagement du Territoire", d_lettres),
        ("Psychologie",                              d_edu),
        ("Sciences de l'Éducation et de la Formation", d_edu),
        ("Philosophie",                              d_lettres),
        ("Socio-Anthropologie",                      d_lettres),
        ("Histoire et Archéologie",                  d_lettres),
        ("Psychologie du Travail et des Organisations", d_eco),
    ]:
        upsert_field(session, label=label, university_id=fashs.id,
                     domain_id=dom.id, admin_id=admin_id)

    # ── 13. ENSTIC ────────────────────────────────────────────
    enstic = upsert_university(session,
        name="École Nationale des Sciences et Techniques de l'Information et de la Communication",
        acronym="ENSTIC", country_id=country_id, admin_id=admin_id)
    for label in ["Journalisme", "Métiers de l'Audiovisuel et du Multimédia"]:
        upsert_field(session, label=label, university_id=enstic.id,
                     domain_id=d_lettres.id, admin_id=admin_id)

    # ── 14. ENAM ─────────────────────────────────────────────
    enam = upsert_university(session,
        name="École Nationale d'Administration",
        acronym="ENAM", country_id=country_id, admin_id=admin_id)
    for label in [
        "Administration Générale", "Administration des Finances",
        "Secrétariat de Gestion",
        "Sciences et Techniques de l'Information Documentaire",
    ]:
        upsert_field(session, label=label, university_id=enam.id,
                     domain_id=d_eco.id, admin_id=admin_id)

    # ── 15. IFRI ─────────────────────────────────────────────
    ifri = upsert_university(session,
        name="Institut de Formation et de Recherche en Informatique",
        acronym="IFRI", country_id=country_id, admin_id=admin_id)
    for label, dom in [
        ("Génie Logiciel",                               d_info),
        ("Internet et Multimédia",                       d_info),
        ("Intelligence Artificielle",                    d_info),
        ("Systèmes Embarqués et Internet des Objets (SEIoT)", d_iot),
        ("Sécurité Informatique",                        d_info),
    ]:
        upsert_field(session, label=label, university_id=ifri.id,
                     domain_id=dom.id, admin_id=admin_id)

    # ── 16. FSA ──────────────────────────────────────────────
    fsa = upsert_university(session,
        name="Faculté des Sciences Agronomiques",
        acronym="FSA", country_id=country_id, admin_id=admin_id)
    for label in [
        "Sciences et Techniques de Production Végétale",
        "Sciences et Techniques de Production Animale",
        "Aménagement et Gestion des Forêts et Parcours Naturels",
        "Génie Rural, Mécanisation Agricole, Pêche et Aquaculture",
        "Nutrition et Technologie Alimentaires",
        "Agroéconomie, Sociologie et Vulgarisation Rurales",
        "Entreprenariat Agricole",
    ]:
        upsert_field(session, label=label, university_id=fsa.id,
                     domain_id=d_agri.id, admin_id=admin_id)

    # ── 17. FSS ──────────────────────────────────────────────
    fss = upsert_university(session,
        name="Faculté des Sciences de la Santé",
        acronym="FSS", country_id=country_id, admin_id=admin_id)
    for label in [
        "Médecine Générale", "Pharmacie", "Kinésithérapie",
        "Assistance Sociale", "Nutrition et Diététique",
    ]:
        upsert_field(session, label=label, university_id=fss.id,
                     domain_id=d_sante.id, admin_id=admin_id)

    # ── 18. EPAC ─────────────────────────────────────────────
    epac = upsert_university(session,
        name="École Polytechnique d'Abomey-Calavi",
        acronym="EPAC", country_id=country_id, admin_id=admin_id)
    for label, dom in [
        ("Analyse Biomédicale",                         d_sante),
        ("Génie de Technologie Alimentaire",            d_agri),
        ("Production et Santé Animales",                d_agri),
        ("Génie de l'Environnement",                    d_agri),
        ("Génie d'Imagerie Médicale et de Radiobiologie", d_sante),
        ("Génie Civil",                                 d_civil),
        ("Génie Électrique",                            d_elec),
        ("Génie Mécanique et Énergétique",              d_meca),
        ("Génie Informatique et Télécom",               d_info),
        ("Génie Chimique Procédés",                     d_agri),
        ("Machinisme Agricole",                         d_meca),
        ("Génie Biomédical (Maintenance Biomédicale et Hospitalière)", d_sante),
    ]:
        upsert_field(session, label=label, university_id=epac.id,
                     domain_id=dom.id, admin_id=admin_id)

    # ── 19. CEFORP ───────────────────────────────────────────
    ceforp = upsert_university(session,
        name="Centre de Formation et de Recherche en matière de Population",
        acronym="CEFORP", country_id=country_id, admin_id=admin_id)
    upsert_field(session,
        label="Dynamique de Population et Planification Régionale",
        university_id=ceforp.id, domain_id=d_eco.id, admin_id=admin_id)

    # ── 20. HERCI ────────────────────────────────────────────
    herci = upsert_university(session,
        name="Haute École Régionale de Commerce International",
        acronym="HERCI", country_id=country_id, admin_id=admin_id)
    for label in ["Négoce International", "Gestion des Relations Maritimes Internationales",
                  "Commerce International"]:
        upsert_field(session, label=label, university_id=herci.id,
                     domain_id=d_eco.id, admin_id=admin_id)

    # ── 21. INJEPS ───────────────────────────────────────────
    injeps = upsert_university(session,
        name="Institut National de l'Éducation Physique et Sportive",
        acronym="INJEPS", country_id=country_id, admin_id=admin_id)
    for label in [
        "Éducation Physique et Sportive", "Entraînement Sportif",
        "Développement Communautaire", "Andragogie",
        "Récréologie", "Entrepreneuriat Social",
    ]:
        upsert_field(session, label=label, university_id=injeps.id,
                     domain_id=d_edu.id, admin_id=admin_id)

    # ── 22. ENS Porto-Novo ───────────────────────────────────
    ens_pn = upsert_university(session,
        name="École Normale Supérieure de Porto-Novo",
        acronym="ENS/Porto-Novo", country_id=country_id, admin_id=admin_id)
    for label in ["Histoire et Géographie", "Espagnol", "Allemand",
                  "Anglais", "Français", "Philosophie"]:
        upsert_field(session, label=label, university_id=ens_pn.id,
                     domain_id=d_edu.id, admin_id=admin_id)

    # ── 23. FADESP ───────────────────────────────────────────
    fadesp = upsert_university(session,
        name="Faculté de Droit et de Science Politique",
        acronym="FADESP", country_id=country_id, admin_id=admin_id)
    for label in ["Droit", "Sciences Politiques"]:
        upsert_field(session, label=label, university_id=fadesp.id,
                     domain_id=d_droit.id, admin_id=admin_id)

    # ── 24. FASEG ────────────────────────────────────────────
    faseg_uac = upsert_university(session,
        name="Faculté des Sciences Économiques et de Gestion de l'UAC",
        acronym="FASEG-UAC", country_id=country_id, admin_id=admin_id)
    for label, dom in [
        ("Sciences Économiques et de Gestion (Tronc Commun)", d_eco),
        ("Économétrie et Statistiques Appliquées",            d_eco),
        ("Sciences et Techniques Comptables et Financières",  d_eco),
    ]:
        upsert_field(session, label=label, university_id=faseg_uac.id,
                     domain_id=dom.id, admin_id=admin_id)

    # ── 25. FAST ─────────────────────────────────────────────
    fast = upsert_university(session,
        name="Faculté des Sciences et Techniques de l'UAC",
        acronym="FAST-UAC", country_id=country_id, admin_id=admin_id)
    for label, dom in [
        ("Sciences de la Vie et de la Terre",       d_agri),
        ("Physique-Chimie",                         d_elec),
        ("Mathématiques Informatique et Applications", d_info),
        ("Énergies Renouvelables et Systèmes Énergétiques", d_elec),
        ("Génétique, Biotechnologies et Ressources Biologiques", d_agri),
        ("Microbiologie et Biotechnologie Alimentaire", d_agri),
        ("Hydrobiologie Appliquée",                 d_agri),
    ]:
        upsert_field(session, label=label, university_id=fast.id,
                     domain_id=dom.id, admin_id=admin_id)

    # ── 26. Institut Confucius ────────────────────────────────
    confucius = upsert_university(session,
        name="Institut Confucius de l'UAC",
        acronym="IC-UAC", country_id=country_id, admin_id=admin_id)
    for label in ["Langue Chinoise", "Didactique du Chinois"]:
        upsert_field(session, label=label, university_id=confucius.id,
                     domain_id=d_edu.id, admin_id=admin_id)

    print("  ✅ UAC — terminé")


# ─────────────────────────────────────────────────────────────
# II — Université de Parakou (UP)
# ─────────────────────────────────────────────────────────────

def seed_up(session, country_id, admin_id=None):
    print("\n📗 Seed UP — Université de Parakou...")

    d_info   = get_domain(session, "Informatique & Numérique")
    d_sante  = get_domain(session, "Médecine & Sciences de la Santé")
    d_agri   = get_domain(session, "Agriculture & Environnement")
    d_droit  = get_domain(session, "Droit & Sciences Juridiques")
    d_eco    = get_domain(session, "Économie & Gestion")
    d_edu    = get_domain(session, "Sciences de l'Éducation")
    d_lettres= get_domain(session, "Lettres & Sciences Humaines")

    # ── 1. FA ─────────────────────────────────────────────────
    fa_up = upsert_university(session,
        name="Faculté d'Agronomie de Parakou",
        acronym="FA-UP", country_id=country_id, admin_id=admin_id)
    for label in [
        "Sciences et Techniques de Production Végétale",
        "Sciences et Techniques de Production Animale et Halieutique",
        "Aménagement et Gestion des Ressources Naturelles",
        "Sociologie et Économie Rurales",
        "Nutrition et Sciences Agroalimentaires",
    ]:
        upsert_field(session, label=label, university_id=fa_up.id,
                     domain_id=d_agri.id, admin_id=admin_id)

    # ── 2. Faculté de Médecine ────────────────────────────────
    fm_up = upsert_university(session,
        name="Faculté de Médecine de Parakou",
        acronym="FM-UP", country_id=country_id, admin_id=admin_id)
    upsert_field(session, label="Médecine Humaine",
                 university_id=fm_up.id, domain_id=d_sante.id, admin_id=admin_id)

    # ── 3. ENATSE ─────────────────────────────────────────────
    enatse = upsert_university(session,
        name="École Nationale de Formation des Techniciens Supérieurs en Santé Publique et Surveillance Épidémiologique",
        acronym="ENATSE", country_id=country_id, admin_id=admin_id)
    upsert_field(session,
        label="Santé Publique et Surveillance Épidémiologique",
        university_id=enatse.id, domain_id=d_sante.id, admin_id=admin_id)

    # ── 4. IFSIO ─────────────────────────────────────────────
    ifsio = upsert_university(session,
        name="Institut de Formation en Soins Infirmiers et Obstétricaux de Parakou",
        acronym="IFSIO-UP", country_id=country_id, admin_id=admin_id)
    for label in ["Soins Infirmiers", "Soins Obstétricaux"]:
        upsert_field(session, label=label, university_id=ifsio.id,
                     domain_id=d_sante.id, admin_id=admin_id)

    # ── 5. IUT Parakou ────────────────────────────────────────
    iut_up = upsert_university(session,
        name="Institut Universitaire de Technologie de Parakou",
        acronym="IUT-UP", country_id=country_id, admin_id=admin_id)
    for label, dom in [
        ("Gestion des Banques",             d_eco),
        ("Gestion Commerciale",             d_eco),
        ("Gestion des Entreprises",         d_eco),
        ("Gestion des Transports et Logistiques", d_eco),
        ("Informatique de Gestion",         d_info),
        ("Gestion des Ressources Humaines", d_eco),
    ]:
        upsert_field(session, label=label, university_id=iut_up.id,
                     domain_id=dom.id, admin_id=admin_id)

    # ── 6. ENSPD ─────────────────────────────────────────────
    enspd = upsert_university(session,
        name="École Nationale de Statistique, de Planification et de Démographie",
        acronym="ENSPD", country_id=country_id, admin_id=admin_id)
    for label in ["Statistiques Appliquées", "Planification et Suivi Évaluation"]:
        upsert_field(session, label=label, university_id=enspd.id,
                     domain_id=d_eco.id, admin_id=admin_id)

    # ── 7. FASEG Parakou ──────────────────────────────────────
    faseg_up = upsert_university(session,
        name="Faculté des Sciences Économiques et de Gestion de Parakou",
        acronym="FASEG-UP", country_id=country_id, admin_id=admin_id)
    for label in [
        "Analyse et Politique Économiques",
        "Économie Agricole",
        "Économie et Finance des Collectivités Locales",
        "Économie et Finance Internationales",
        "Entrepreneuriat et Gestion des Entreprises",
        "Marketing et Management des Organisations",
        "Finance et Comptabilité",
    ]:
        upsert_field(session, label=label, university_id=faseg_up.id,
                     domain_id=d_eco.id, admin_id=admin_id)

    # ── 8. FDSP Parakou ───────────────────────────────────────
    fdsp = upsert_university(session,
        name="Faculté de Droit et Sciences Politiques de Parakou",
        acronym="FDSP-UP", country_id=country_id, admin_id=admin_id)
    for label in ["Droit Privé", "Droit Public",
                  "Sciences Politiques et Relations Internationales"]:
        upsert_field(session, label=label, university_id=fdsp.id,
                     domain_id=d_droit.id, admin_id=admin_id)

    # ── 9. FLASH Parakou ─────────────────────────────────────
    flash_up = upsert_university(session,
        name="Faculté des Lettres, Arts et Sciences Humaines de Parakou",
        acronym="FLASH-UP", country_id=country_id, admin_id=admin_id)
    for label, dom in [
        ("Allemand",                 d_lettres),
        ("Anglais",                  d_lettres),
        ("Espagnol",                 d_lettres),
        ("Géographie et Aménagement du Territoire", d_lettres),
        ("Sociologie Anthropologie", d_lettres),
        ("Lettres Modernes",         d_lettres),
    ]:
        upsert_field(session, label=label, university_id=flash_up.id,
                     domain_id=dom.id, admin_id=admin_id)

    print("  ✅ UP — terminé")


# ─────────────────────────────────────────────────────────────
# III — UNSTIM (Université Nationale des Sciences,
#               Technologies, Ingénierie et Mathématiques)
# ─────────────────────────────────────────────────────────────

def seed_unstim(session, country_id, admin_id=None):
    print("\n📙 Seed UNSTIM — Abomey...")

    d_info  = get_domain(session, "Informatique & Numérique")
    d_elec  = get_domain(session, "Génie Électrique & Énergie")
    d_civil = get_domain(session, "Génie Civil & Construction")
    d_meca  = get_domain(session, "Génie Mécanique & Industriel")
    d_edu   = get_domain(session, "Sciences de l'Éducation")
    d_agri  = get_domain(session, "Agriculture & Environnement")
    d_iot   = get_domain(session, "Électronique, Robotique & IoT")

    # ── 1. ENSET ─────────────────────────────────────────────
    enset = upsert_university(session,
        name="École Normale Supérieure de l'Enseignement Technique",
        acronym="ENSET", country_id=country_id, admin_id=admin_id)
    for label, dom in [
        ("Comptabilité",            d_edu),
        ("Économie",                d_edu),
        ("Électrotechnique",        d_edu),
        ("Génie Civil",             d_edu),
        ("Secrétariat",             d_edu),
        ("Mécanique Automobile",    d_edu),
        ("Fabrication Mécanique",   d_edu),
        ("Économie Familiale et Sociale", d_edu),
        ("Hôtellerie-Restauration", d_edu),
        ("Froid et Climatisation",  d_edu),
        ("Électronique",            d_edu),
        ("Énergies Renouvelables",  d_edu),
        ("Production Animale",      d_edu),
        ("Production Végétale",     d_edu),
    ]:
        upsert_field(session, label=label, university_id=enset.id,
                     domain_id=dom.id, admin_id=admin_id)

    # ── 2. INSTI ─────────────────────────────────────────────
    # Déjà seedé via seed_insti() dans seed.py original
    # On vérifie simplement sa présence et on ajoute si absent
    insti_name = "Institut National Supérieur de Technologie Industrielle (INSTI)".upper()
    insti = session.exec(select(University).where(func.upper(University.name) == insti_name)).first()
    if not insti:
        insti = upsert_university(session,
            name="Institut National Supérieur de Technologie Industrielle (INSTI)",
            acronym="INSTI", country_id=country_id, admin_id=admin_id)
        for label, dom in [
            ("Génie Civil",                                           d_civil),
            ("Génie Énergétique (Énergies Renouvelables et Systèmes Énergétiques)", d_elec),
            ("Génie Énergétique (Froid et Climatisation)",            d_elec),
            ("Génie Électrique et Informatique (Informatique et Télécommunications)", d_info),
            ("Génie Électrique et Informatique (Électronique et Électrotechnique)",   d_elec),
            ("Génie Mécanique et Productique",                        d_meca),
            ("Maintenance des Systèmes (Maintenance Industrielle)",   d_meca),
            ("Maintenance des Systèmes (Maintenance Automobile)",     d_meca),
        ]:
            upsert_field(session, label=label, university_id=insti.id,
                         domain_id=dom.id, admin_id=admin_id)
    else:
        print(f"    ℹ️  INSTI déjà en base (seedé précédemment)")

    # ── 3. INSPEI ────────────────────────────────────────────
    inspei = upsert_university(session,
        name="Institut National Supérieur des Classes Préparatoires aux Études d'Ingénieurs",
        acronym="INSPEI", country_id=country_id, admin_id=admin_id)
    upsert_field(session,
        label="Sciences et Techniques de l'Ingénieur",
        university_id=inspei.id, domain_id=d_elec.id, admin_id=admin_id)

    # ── 4. ENS Natitingou ─────────────────────────────────────
    ens_nati = upsert_university(session,
        name="École Normale Supérieure de Natitingou",
        acronym="ENS/Nati", country_id=country_id, admin_id=admin_id)
    for label, dom in [
        ("Mathématiques et Informatique",    d_edu),
        ("Physique, Chimie et Technologie",  d_edu),
        ("Sciences de la Vie et de la Terre", d_edu),
    ]:
        upsert_field(session, label=label, university_id=ens_nati.id,
                     domain_id=dom.id, admin_id=admin_id)

    # ── 5. ENSBBA ────────────────────────────────────────────
    ensbba = upsert_university(session,
        name="École Nationale Supérieure des Biosciences et Biotechnologies Appliquées",
        acronym="ENSBBA", country_id=country_id, admin_id=admin_id)
    for label in [
        "Biotechnologie Médicale", "Biotechnologie Pharmaceutique",
        "Génétique Biotechnologies et Applications",
        "Génie Biologique et Bioprocédés",
        "Diététique des Aliments et Nutrition",
    ]:
        upsert_field(session, label=label, university_id=ensbba.id,
                     domain_id=d_agri.id, admin_id=admin_id)

    # ── 6. FAST Natitingou ────────────────────────────────────
    fast_nati = upsert_university(session,
        name="Faculté des Sciences et Techniques de Natitingou",
        acronym="FAST/Nati", country_id=country_id, admin_id=admin_id)
    for label, dom in [
        ("Mathématiques Informatiques",   d_info),
        ("Physique Chimie",               d_elec),
        ("Froid et Climatisation",        d_elec),
        ("Équipements Motorisés",         d_meca),
    ]:
        upsert_field(session, label=label, university_id=fast_nati.id,
                     domain_id=dom.id, admin_id=admin_id)

    # ── 7. ENSGEP ────────────────────────────────────────────
    ensgep = upsert_university(session,
        name="École Nationale Supérieure de Génie Énergétique et Procédés",
        acronym="ENSGEP", country_id=country_id, admin_id=admin_id)
    for label, dom in [
        ("Froid et Climatisation",  d_elec),
        ("Équipements Motorisés",   d_meca),
    ]:
        upsert_field(session, label=label, university_id=ensgep.id,
                     domain_id=dom.id, admin_id=admin_id)

    # ── 8. ENSTP ─────────────────────────────────────────────
    enstp = upsert_university(session,
        name="École Nationale Supérieure des Travaux Publics",
        acronym="ENSTP", country_id=country_id, admin_id=admin_id)
    for label, dom in [
        ("Génie Civil",                  d_civil),
        ("Génie Géomatique Appliquée",   d_civil),
        ("Architecture et Urbanisme",    d_civil),
        ("Hydraulique et Assainissement", d_civil),
    ]:
        upsert_field(session, label=label, university_id=enstp.id,
                     domain_id=dom.id, admin_id=admin_id)

    print("  ✅ UNSTIM — terminé")


# ─────────────────────────────────────────────────────────────
# IV — Université Nationale d'Agriculture (UNA)
# ─────────────────────────────────────────────────────────────

def seed_una(session, country_id, admin_id=None):
    print("\n📒 Seed UNA — Université Nationale d'Agriculture (Kétou)...")

    d_agri = get_domain(session, "Agriculture & Environnement")
    d_eco  = get_domain(session, "Économie & Gestion")
    d_elec = get_domain(session, "Génie Électrique & Énergie")
    d_civil= get_domain(session, "Génie Civil & Construction")
    d_meca = get_domain(session, "Génie Mécanique & Industriel")

    # ── 1. École d'Aquaculture ────────────────────────────────
    eaq = upsert_university(session,
        name="École d'Aquaculture de l'UNA",
        acronym="EAq-UNA", country_id=country_id, admin_id=admin_id)
    upsert_field(session, label="Aquaculture",
                 university_id=eaq.id, domain_id=d_agri.id, admin_id=admin_id)

    # ── 2. EHAEV ─────────────────────────────────────────────
    ehaev = upsert_university(session,
        name="École d'Horticulture et d'Aménagement des Espaces Verts",
        acronym="EHAEV", country_id=country_id, admin_id=admin_id)
    upsert_field(session,
        label="Horticulture et Aménagement des Espaces Verts",
        university_id=ehaev.id, domain_id=d_agri.id, admin_id=admin_id)

    # ── 3. EGPVS ─────────────────────────────────────────────
    egpvs = upsert_university(session,
        name="École de Gestion et de Production Végétale et Semencière",
        acronym="EGPVS", country_id=country_id, admin_id=admin_id)
    upsert_field(session,
        label="Gestion et Production Végétale et Semencière",
        university_id=egpvs.id, domain_id=d_agri.id, admin_id=admin_id)

    # ── 4. ESTCTPA ───────────────────────────────────────────
    estctpa = upsert_university(session,
        name="École des Sciences et Techniques de Conservation et de Transformation des Produits Agricoles",
        acronym="ESTCTPA", country_id=country_id, admin_id=admin_id)
    for label in [
        "Industrie des Produits Agro-Alimentaires et Nutrition Humaine",
        "Industrie des BioRessources",
        "Génie de Conditionnement Emballage et Stockage des Produits Alimentaires",
    ]:
        upsert_field(session, label=label, university_id=estctpa.id,
                     domain_id=d_agri.id, admin_id=admin_id)

    # ── 5. EGR ───────────────────────────────────────────────
    egr = upsert_university(session,
        name="École de Génie Rural de l'UNA",
        acronym="EGR-UNA", country_id=country_id, admin_id=admin_id)
    for label, dom in [
        ("Agroéquipement",                         d_meca),
        ("Électrification Rurale et Énergies Renouvelables", d_elec),
        ("Infrastructures Rurales et Assainissement", d_civil),
    ]:
        upsert_field(session, label=label, university_id=egr.id,
                     domain_id=dom.id, admin_id=admin_id)

    # ── 6. EGESE ─────────────────────────────────────────────
    egese = upsert_university(session,
        name="École de Gestion et d'Exploitation des Systèmes d'Élevage",
        acronym="EGESE", country_id=country_id, admin_id=admin_id)
    upsert_field(session,
        label="Productions et Santé Animales",
        university_id=egese.id, domain_id=d_agri.id, admin_id=admin_id)

    # ── 7. EAPA ──────────────────────────────────────────────
    eapa = upsert_university(session,
        name="École d'Agrobusiness et de Politiques Agricoles",
        acronym="EAPA", country_id=country_id, admin_id=admin_id)
    for label in [
        "Finance Agricole",
        "Gestion des Exploitations Agricoles et Entreprises Agroalimentaires",
        "Marketing des Intrants et Produits Agricoles",
    ]:
        upsert_field(session, label=label, university_id=eapa.id,
                     domain_id=d_eco.id, admin_id=admin_id)

    # ── 8. ESRVA ─────────────────────────────────────────────
    esrva = upsert_university(session,
        name="École de Sociologie Rurale et de Vulgarisation Agricole",
        acronym="ESRVA", country_id=country_id, admin_id=admin_id)
    upsert_field(session,
        label="Sociologie Rurale et Vulgarisation Agricole",
        university_id=esrva.id, domain_id=d_agri.id, admin_id=admin_id)

    # ── 9. EForT ─────────────────────────────────────────────
    efort = upsert_university(session,
        name="École de Foresterie Tropicale",
        acronym="EForT", country_id=country_id, admin_id=admin_id)
    upsert_field(session,
        label="Foresterie Tropicale",
        university_id=efort.id, domain_id=d_agri.id, admin_id=admin_id)

    print("  ✅ UNA — terminé")


# ─────────────────────────────────────────────────────────────
# V — IUEP (Institut Universitaire d'Enseignement Professionnel)
# ─────────────────────────────────────────────────────────────

def seed_iuep(session, country_id, admin_id=None):
    print("\n📔 Seed IUEP...")

    d_agri = get_domain(session, "Agriculture & Environnement")
    iuep = upsert_university(session,
        name="Institut Universitaire d'Enseignement Professionnel",
        acronym="IUEP", country_id=country_id, admin_id=admin_id)
    upsert_field(session, label="Métiers de l'Agriculture",
                 university_id=iuep.id, domain_id=d_agri.id, admin_id=admin_id)
    print("  ✅ IUEP — terminé")


# ─────────────────────────────────────────────────────────────
# VI — Sèmè City
# ─────────────────────────────────────────────────────────────

def seed_seme_city(session, country_id, admin_id=None):
    print("\n🏙️  Seed Sèmè City...")

    d_info = get_domain(session, "Informatique & Numérique")
    d_edu  = get_domain(session, "Sciences de l'Éducation")

    # Africa Design School
    ads = upsert_university(session,
        name="Africa Design School — Sèmè City",
        acronym="ADS", country_id=country_id, admin_id=admin_id,
        website="https://semecity.bj")
    upsert_field(session, label="Licence en Design",
                 university_id=ads.id, domain_id=d_edu.id, admin_id=admin_id)

    # EPITECH Bénin
    epitech = upsert_university(session,
        name="École de l'Innovation et de l'Expertise Informatique — Sèmè City (EPITECH)",
        acronym="EPITECH-Bénin", country_id=country_id, admin_id=admin_id,
        website="https://semecity.bj")
    upsert_field(session,
        label="Licence en Métier de l'Informatique",
        university_id=epitech.id, domain_id=d_info.id, admin_id=admin_id)

    print("  ✅ Sèmè City — terminé")


# ─────────────────────────────────────────────────────────────
# Point d'entrée
# ─────────────────────────────────────────────────────────────

def seed_all_universities(admin_id=None):
    """
    Fonction principale à appeler depuis seed.py ou directement.
    Idempotent : peut être relancé sans créer de doublons.
    """
    print("\n" + "=" * 60)
    print("🚀 Démarrage du seed des universités béninoises")
    print("=" * 60)

    with Session(engine) as session:
        # Récupère le Bénin
        benin = session.exec(
            select(Country).where(Country.iso_code == "BEN")
        ).first()
        if not benin:
            raise RuntimeError(
                "❌ Le pays 'Bénin' (iso_code='BEN') est introuvable en base.\n"
                "   Lance d'abord : python seed.py"
            )

        # Vérifie que les domaines de base sont présents
        test_domain = session.exec(
            select(Domain).where(Domain.label == "Informatique & Numérique")
        ).first()
        if not test_domain:
            raise RuntimeError(
                "❌ Les domaines de base sont absents.\n"
                "   Lance d'abord : python seed.py"
            )

        country_id = benin.id

        seed_uac(session, country_id, admin_id)
        seed_up(session, country_id, admin_id)
        seed_unstim(session, country_id, admin_id)
        seed_una(session, country_id, admin_id)
        seed_iuep(session, country_id, admin_id)
        seed_seme_city(session, country_id, admin_id)

        session.commit()

    print("\n" + "=" * 60)
    print("✅ Seed complet des universités béninoises terminé !")
    print("=" * 60)


# ─────────────────────────────────────────────────────────────
# Exécution directe : python seed_universities_benin.py
# ─────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import argparse
    import sys
    from sqlmodel import select as sqlm_select
    from app.models import User
    from app.models.enums import UserRole as UR

    parser = argparse.ArgumentParser(
        description="Seed des universités et filières béninoises (Guide 2024-2025)"
    )
    parser.add_argument(
        "--admin-email", type=str,
        help="Email du compte admin à utiliser comme auteur du seed"
    )
    args = parser.parse_args()

    admin_id = None
    if args.admin_email:
        with Session(engine) as s:
            admin_user = s.exec(
                sqlm_select(User).where(User.email == args.admin_email)
            ).first()
            if not admin_user:
                print(f"❌ Utilisateur '{args.admin_email}' introuvable.")
                sys.exit(1)
            if admin_user.role != UR.admin:
                print(f"❌ '{args.admin_email}' n'a pas le rôle admin.")
                sys.exit(1)
            admin_id = admin_user.id
            print(f"👑 Admin trouvé : {admin_user.full_name} (id={admin_id})")

    seed_all_universities(admin_id=admin_id)