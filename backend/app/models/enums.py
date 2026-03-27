# app/models/enums.py
"""
Tous les Enum du projet centralisés ici.

Pourquoi des Enum et pas des str libres ?
- Sécurité : impossible d'écrire status="approvd" par erreur
- Lisibilité : l'IDE autocompléte les valeurs
- Cohérence : une seule source de vérité pour les valeurs autorisées
- Validation automatique par FastAPI/Pydantic à chaque requête
"""

from enum import Enum


# ==========================================
# UTILISATEUR
# ==========================================
class UserRole(str, Enum):
    student    = "student"     # Étudiant lambda
    ambassador = "ambassador" # Ambassadeur (université/filière)
    moderator  = "moderator"   # Modérateur de contenu
    admin      = "admin"       # Administrateur de la plateforme


# ==========================================
# MÉMOIRE
# ==========================================
class MemoirStatus(str, Enum):
    pending      = "pending"       # En attente de validation (état initial)
    pre_validated = "pre_validated" # Pré-validé par ambassadeur (facultatif)
    approved    = "approved"      # Validé par modérateur, visible par tous
    rejected    = "rejected"      # Rejeté, visible uniquement par l'auteur


class DegreeLevel(str, Enum):
    """
    Degrés académiques supportés.
    Extensible facilement si besoin (ex: BTS, DUT, etc.)
    """
    licence   = "licence"    # Bac+3
    master    = "master"     # Bac+5
    doctorat  = "doctorat"   # Bac+8
    ingenieur = "ingenieur"  # Diplôme d'ingénieur (Bac+5 dans certains pays)
    bts       = "bts"        # Brevet de Technicien Supérieur
    dut       = "dut"        # Diplôme Universitaire de Technologie


# ==========================================
# UNIVERSITÉ
# ==========================================
class UniversityStatus(str, Enum):
    pending  = "pending"   # Soumise, en attente de vérification admin
    approved = "approved"  # Vérifiée et acceptée
    rejected = "rejected"  # Refusée (doublon, fausse info, etc.)


# ==========================================
# DOMAINE
# ==========================================
class DomainStatus(str, Enum):
    active   = "active"    # Domaine actif, visible dans les filtres
    inactive = "inactive"  # Domaine désactivé (archive)
