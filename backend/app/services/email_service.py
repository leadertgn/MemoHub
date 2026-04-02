import httpx
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

async def send_email_async(to_email: str, to_name: str, subject: str, html_content: str):
    """
    Service pour envoyer un email via l'API Brevo v3 (https://api.brevo.com/v3/smtp/email)
    en tâche de fond (BackgroundTasks).
    """
    if not settings.BREVO_API_KEY:
        print("⚠️ [EMAIL] BREVO_API_KEY n'est pas définie. L'email ne sera pas envoyé.")
        logger.warning("BREVO_API_KEY n'est pas définie. L'email ne sera pas envoyé.")
        return False
        
    url = "https://api.brevo.com/v3/smtp/email"
    headers = {
        "accept": "application/json",
        "api-key": settings.BREVO_API_KEY,
        "content-type": "application/json"
    }
    
    payload = {
        "sender": {"name": settings.BREVO_SENDER_NAME, "email": settings.BREVO_SENDER_EMAIL},
        "to": [{"email": to_email, "name": to_name}],
        "subject": subject,
        "htmlContent": html_content
    }
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload, headers=headers)
            response.raise_for_status()
            print(f"✅ [EMAIL ENVOYE] succès vers {to_email} (Sujet: {subject})")
            logger.info(f"Email envoyé avec succès à {to_email}")
            return True
    except httpx.HTTPStatusError as exc:
        print(f"❌ [EMAIL ERREUR] Erreur HTTP avec Brevo: {exc.response.text}")
        logger.error(f"Erreur HTTP avec Brevo: {exc.response.text}")
        return False
    except Exception as e:
        print(f"❌ [EMAIL ERREUR] Erreur générale lors de l'envoi de l'email à {to_email} : {e}")
        logger.error(f"Erreur lors de l'envoi de l'email à {to_email} : {e}")
        return False

# --- Templates de base ---

def get_approval_email_html(
    user_name: str,
    document_title: str,
    university_name: str = None,
    field_name: str = None,
    year: int = None,
    degree: str = None
) -> str:
    details_parts = []
    if university_name:
        details_parts.append(f"Université : <strong>{university_name}</strong>")
    if field_name:
        details_parts.append(f"Filière : <strong>{field_name}</strong>")
    if year:
        details_parts.append(f"Année : <strong>{year}</strong>")
    if degree:
        details_parts.append(f"Niveau : <strong>{degree}</strong>")
    
    details_html = ""
    if details_parts:
        items_html = "".join([f'<p style="margin: 3px 0; color: #166534;">{d}</p>' for d in details_parts])
        details_html = f"""
        <div style="background-color: #f0fdf4; border: 1px solid #86efac; padding: 12px; border-radius: 6px; margin: 15px 0;">
          <p style="margin: 5px 0;"><strong>Détails du document :</strong></p>
          {items_html}
        </div>
        """
    
    return f"""
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #16a34a;">Félicitations ! Votre mémoire a été approuvé</h2>
        <p>Bonjour <b>{user_name}</b>,</p>
        <p>Votre mémoire intitulé <strong style="color: #1e40af; font-size: 18px;">"{document_title}"</strong> a été officiellement approuvé par notre équipe de modération.</p>
        {details_html}
        <p>Il est désormais protégé via notre filigrane et accessible à la communauté étudiante.</p>
        <p>Vous pouvez le retrouver sur la plateforme en cliquant sur le lien ci-dessous :</p>
        <p><a href="{settings.FRONTEND_URL}" style="background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 10px 0;">Voir le mémoire</a></p>
        <br/>
        <p>Merci pour votre contribution au savoir académique via MemoHub !</p>
        <p style="color: #6b7280; font-size: 12px;">L'équipe MemoHub</p>
      </body>
    </html>
    """


def get_rejection_email_html(
    user_name: str,
    document_title: str,
    reason: str,
    university_name: str = None,
    field_name: str = None,
    year: int = None,
    degree: str = None
) -> str:
    details_parts = []
    if university_name:
        details_parts.append(f"Université : <strong>{university_name}</strong>")
    if field_name:
        details_parts.append(f"Filière : <strong>{field_name}</strong>")
    if year:
        details_parts.append(f"Année : <strong>{year}</strong>")
    if degree:
        details_parts.append(f"Niveau : <strong>{degree}</strong>")
    
    details_html = ""
    if details_parts:
        items_html = "".join([f'<p style="margin: 3px 0; color: #854d0e;">{d}</p>' for d in details_parts])
        details_html = f"""
        <div style="background-color: #fef9c3; border: 1px solid #fde047; padding: 12px; border-radius: 6px; margin: 15px 0;">
          <p style="margin: 5px 0;"><strong>Document concerné :</strong></p>
          {items_html}
        </div>
        """
    
    return f"""
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #dc2626;">Mise à jour de votre soumission</h2>
        <p>Bonjour <b>{user_name}</b>,</p>
        <p>Nous avons soigneusement étudié votre mémoire intitulé <strong>"{document_title}"</strong>.</p>
        {details_html}
        <p>Malheureusement, il n'a pas pu être validé pour la raison suivante :</p>
        <blockquote style="border-left: 4px solid #dc2626; padding-left: 15px; color: #dc2626; font-style: italic; background-color: #fef2f2; padding: 15px; margin: 15px 0;">
          <strong>Motif du refus :</strong><br/>"{reason}"
        </blockquote>
        <p>Nous vous encourageons à consulter votre espace <a href="{settings.FRONTEND_URL}/" style="color: #2563eb;">Profil</a> pour prendre connaissance de cette décision ou uploader une version corrigée.</p>
        <p>Si vous avez des questions concernant ce refus, n'hésitez pas à nous contacter.</p>
        <br/>
        <p>Cordialement,</p>
        <p style="color: #6b7280; font-size: 12px;">L'équipe de Modération MemoHub</p>
      </body>
    </html>
    """

def get_suggestion_approved_html(
    user_name: str, 
    type_suggestion: str, 
    name: str,
    country_name: str = None,
    university_name: str = None,
    acronym: str = None,
    website: str = None
) -> str:
    label_type = "l'université" if type_suggestion == "university" else "la filière"
    
    details_parts = []
    if country_name:
        details_parts.append(f"Pays : <strong>{country_name}</strong>")
    if university_name and type_suggestion == "field":
        details_parts.append(f"Université : <strong>{university_name}</strong>")
    if acronym:
        details_parts.append(f"Acronyme : <strong>{acronym}</strong>")
    if website:
        details_parts.append(f"Site web : <strong>{website}</strong>")
    
    details_html = ""
    if details_parts:
        items_html = "".join([f'<p style="margin: 3px 0; color: #166534;">{d}</p>' for d in details_parts])
        details_html = f"""
        <div style="background-color: #f0fdf4; border: 1px solid #86efac; padding: 12px; border-radius: 6px; margin: 15px 0;">
          <p style="margin: 5px 0;"><strong>Détails :</strong></p>
          {items_html}
        </div>
        """
    
    return f"""
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #16a34a;">Félicitations ! Votre suggestion a été validée</h2>
        <p>Bonjour <b>{user_name}</b>,</p>
        <p>Vous aviez suggéré l'ajout de {label_type} <strong style="color: #1e40af; font-size: 18px;">"{name}"</strong> dans notre structure.</p>
        {details_html}
        <p>Celle-ci vient d'être ajoutée définitivement et publiquement à la base de données de MemoHub !</p>
        <p>Vous et les futurs étudiants pouvez désormais la sélectionner lors des prochains uploads.</p>
        <p>Pour découvrir les autres universités et filières disponibles, cliquez ci-dessous :</p>
        <p><a href="{settings.FRONTEND_URL}/" style="background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 10px 0;">Explorer MemoHub</a></p>
        <br/>
        <p>Toute la communauté vous remercie pour votre implication proactive !</p>
        <p style="color: #6b7280; font-size: 12px;">L'équipe MemoHub</p>
      </body>
    </html>
    """

def get_suggestion_rejected_html(
    user_name: str, 
    type_suggestion: str, 
    name: str, 
    reason: str,
    country_name: str = None,
    university_name: str = None,
    acronym: str = None,
    website: str = None
) -> str:
    label_type = "L'université" if type_suggestion == "university" else "La filière"
    
    details_parts = []
    if country_name:
        details_parts.append(f"Pays : <strong>{country_name}</strong>")
    if university_name and type_suggestion == "field":
        details_parts.append(f"Université : <strong>{university_name}</strong>")
    if acronym:
        details_parts.append(f"Acronyme : <strong>{acronym}</strong>")
    if website:
        details_parts.append(f"Site web : <strong>{website}</strong>")
    
    details_html = ""
    if details_parts:
        items_html = "".join([f'<p style="margin: 3px 0; color: #854d0e;">{d}</p>' for d in details_parts])
        details_html = f"""
        <div style="background-color: #fef9c3; border: 1px solid #fde047; padding: 12px; border-radius: 6px; margin: 15px 0;">
          <p style="margin: 5px 0;"><strong>Suggestion concernée :</strong></p>
          {items_html}
        </div>
        """
    
    return f"""
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #dc2626;">Mise à jour concernant votre suggestion</h2>
        <p>Bonjour <b>{user_name}</b>,</p>
        <p>Merci d'avoir suggéré {label_type.lower()} <strong>"{name}"</strong> pour enrichir notre base de données.</p>
        {details_html}
        <p>Cependant, notre équipe de modération n'a pas pu valider cet ajout pour la raison suivante :</p>
        <blockquote style="border-left: 4px solid #dc2626; padding-left: 15px; color: #dc2626; font-style: italic; background-color: #fef2f2; padding: 15px; margin: 15px 0;">
          <strong>Motif du refus :</strong><br/>"{reason}"
        </blockquote>
        <p>Si vous pensez qu'il s'agit d'une erreur ou si vous souhaitez soumettre une nouvelle suggestion, cliquez sur le lien ci-dessous :</p>
        <p><a href="{settings.FRONTEND_URL}/" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 10px 0;">Soumettre une nouvelle suggestion</a></p>
        <br/>
        <p>Nous restons à votre disposition pour toute question.</p>
        <p style="color: #6b7280; font-size: 12px;">L'équipe de Modération MemoHub</p>
      </body>
    </html>
    """


def get_role_promotion_html(user_name: str, new_role: str, details: str = "") -> str:
    """
    Email de notification lors d'une promotion de rôle.
    details peut contenir des informations spécifiques selon le rôle.
    """
    role_titles = {
        "admin": "Administrateur",
        "moderator": "Modérateur",
        "ambassador": "Ambassadeur",
        "student": "Étudiant"
    }
    role_title = role_titles.get(new_role, new_role)
    
    role_description = ""
    if new_role == "admin":
        role_description = "Vous avez maintenant accès complet au panneau d'administration, incluant la gestion des utilisateurs, la modération et les statistiques."
    elif new_role == "moderator":
        role_description = f"Vous êtes maintenant modérateur{details}. Vous pouvez valider ou rejeter les universités et filières de votre juridiction."
    elif new_role == "ambassador":
        role_description = f"Vous êtes maintenant ambassadeur{details}. Vous pouvez soumettre et modérer les mémoires de votre université."
    elif new_role == "student":
        role_description = "Votre rôle a été ajusté. Vous avez désormais un accès standard à la plateforme."
    
    return f"""
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #7c3aed;">Félicitations ! Votre rôle a été mis à jour</h2>
        <p>Bonjour <b>{user_name}</b>,</p>
        <p>Nous avons le plaisir de vous informer que votre compte MemoHub a été promu au rôle de <strong style="color: #7c3aed;">{role_title}</strong>.</p>
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 15px 0;">
          <p style="margin: 0;">{role_description}</p>
        </div>
        <p>Pour accéder à votre nouvel espace, cliquez sur le lien ci-dessous :</p>
        <p><a href="{settings.FRONTEND_URL}/" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Accéder à mon Dashboard</a></p>
        <br/>
        <p>Nous vous remercions pour votre engagement envers MemoHub !</p>
        <p>L'équipe MemoHub</p>
      </body>
    </html>
    """
