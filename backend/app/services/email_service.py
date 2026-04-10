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

# --- Templates moderne Premium Card ---

def get_base_layout(content_html: str, title: str, preview_text: str = "") -> str:
    """
    Layout de base premium pour tous les emails de MemoHub.
    Design centré, moderne, responsive.
    """
    # Note: On importe ici pour éviter les imports circulaires si nécessaire
    from app.core.config import settings
    return f"""
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>{title}</title>
        <style>
            @media only screen and (max-width: 600px) {{
                .container {{ width: 100% !important; padding: 10px !important; }}
                .content {{ padding: 20px !important; }}
            }}
            body {{ margin: 0; padding: 0; background-color: #f9fafb; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; }}
            .container {{ width: 600px; margin: 0 auto; padding: 40px 0; }}
            .header {{ background: linear-gradient(135deg, #4f46e5 0%, #2563eb 100%); padding: 30px; border-radius: 16px 16px 0 0; text-align: center; }}
            .logo {{ color: #ffffff; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; text-decoration: none; }}
            .content {{ background-color: #ffffff; padding: 40px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }}
            h1 {{ color: #111827; font-size: 22px; font-weight: 700; margin-top: 0; margin-bottom: 20px; line-height: 1.3; }}
            p {{ color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 20px; }}
            .btn {{ display: inline-block; background-color: #4f46e5; color: #ffffff !important; padding: 14px 28px; border-radius: 12px; font-weight: 600; text-decoration: none; transition: all 0.3s ease; box-shadow: 0 4px 10px rgba(79, 70, 229, 0.3); }}
            .footer {{ text-align: center; padding-top: 30px; color: #9ca3af; font-size: 13px; }}
            .card-info {{ background-color: #f3f4f6; border-radius: 12px; padding: 20px; margin-bottom: 25px; border-left: 4px solid #4f46e5; }}
            .label-item {{ font-size: 11px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 4px; }}
            .value-item {{ font-size: 15px; color: #111827; font-weight: 500; }}
        </style>
    </head>
    <body>
        <div style="display: none; max-height: 0px; overflow: hidden;">{preview_text}</div>
        <div class="container">
            <div class="header">
                <div class="logo">
                     <span style="font-size: 28px; vertical-align: middle;">📚</span> MemoHub
                </div>
            </div>
            <div class="content">
                {content_html}
            </div>
            <div class="footer">
                <p>© {settings.BREVO_SENDER_NAME} — La plateforme académique universelle.<br/>
                Faciliter l'accès au savoir pour les chercheurs de demain.</p>
            </div>
        </div>
    </body>
    </html>
    """

def get_approval_email_html(
    user_name: str,
    document_title: str,
    university_name: str = None,
    field_name: str = None,
    year: int = None,
    degree: str = None
) -> str:
    from app.core.config import settings
    
    details_html = ""
    if any([university_name, field_name, year, degree]):
        items = []
        if university_name: items.append(f'<div><span class="label-item">PUBLIÉ PAR</span><span class="value-item">{university_name}</span></div>')
        if field_name: items.append(f'<div><span class="label-item">DOMAINE / FILIÈRE</span><span class="value-item">{field_name}</span></div>')
        if year: items.append(f'<div><span class="label-item">ANNÉE ACADÉMIQUE</span><span class="value-item">{year}</span></div>')
        if degree: items.append(f'<div><span class="label-item">NIVEAU D\'ÉTUDES</span><span class="value-item">{degree}</span></div>')
        
        inner_items = "".join([f'<div style="margin-bottom: 15px;">{i}</div>' for i in items])
        details_html = f'<div class="card-info" style="border-left-color: #10b981; background-color: #ecfdf5;">{inner_items}</div>'

    content = f"""
        <h1>Félicitations ! Votre mémoire est en ligne</h1>
        <p>Bonjour <b>{user_name}</b>,</p>
        <p>Nous avons le plaisir de vous informer que votre mémoire intitulé <br/><strong style="color: #4f46e5; font-size: 18px;">"{document_title}"</strong> a été officiellement approuvé par notre équipe.</p>
        {details_html}
        <p>Il est désormais certifié et protégé sur la plateforme. Toute la communauté académique peut désormais s'inspirer de votre travail.</p>
        <div style="text-align: center; margin: 35px 0;">
            <a href="{settings.FRONTEND_URL}" class="btn">Voir mon document</a>
        </div>
        <p>Merci pour votre précieuse contribution sur MemoHub !</p>
    """
    return get_base_layout(content, "Mémoire Approuvé - MemoHub", f"Bonne nouvelle ! Votre mémoire {document_title} est validé.")

def get_rejection_email_html(
    user_name: str,
    document_title: str,
    reason: str,
    university_name: str = None,
    field_name: str = None
) -> str:
    from app.core.config import settings
    
    details_html = ""
    if university_name or field_name:
        items = []
        if university_name: items.append(f'<span class="value-item">{university_name}</span>')
        if field_name: items.append(f'<span class="value-item"> — {field_name}</span>')
        details_html = f'<div style="margin-bottom: 15px; font-size: 14px; color: #6b7280;">{"".join(items)}</div>'

    content = f"""
        <h1 style="color: #ef4444;">Mise à jour concernant votre soumission</h1>
        <p>Bonjour <b>{user_name}</b>,</p>
        <p>Nous avons étudié votre mémoire intitulé <strong>"{document_title}"</strong>.</p>
        {details_html}
        <p>Malheureusement, nous ne pouvons pas le publier en l'état pour la raison suivante :</p>
        <div style="background-color: #fef2f2; border-radius: 12px; padding: 20px; border-left: 4px solid #ef4444; margin-bottom: 25px;">
            <p style="margin: 0; color: #b91c1c; font-style: italic;">" {reason} "</p>
        </div>
        <p>Ne vous découragez pas ! Vous pouvez corriger ces points et soumettre à nouveau votre document depuis votre espace personnel.</p>
        <div style="text-align: center; margin: 35px 0;">
            <a href="{settings.FRONTEND_URL}/profile" class="btn" style="background-color: #374151;">Accéder à mon profil</a>
        </div>
        <p>Nous restons à votre disposition pour toute question.</p>
    """
    return get_base_layout(content, "Mise à jour MemoHub", "Des précisions sont nécessaires pour votre document.")

def get_suggestion_approved_html(user_name: str, type_suggestion: str, name: str, university_name: str = None) -> str:
    from app.core.config import settings
    label = "l'université" if type_suggestion == "university" else "la filière"
    
    details_context = f"<p>Lieu : <strong>{university_name}</strong></p>" if university_name else ""

    content = f"""
        <h1>Votre suggestion a été retenue !</h1>
        <p>Bonjour <b>{user_name}</b>,</p>
        <p>Vous aviez suggéré l'ajout de {label} <strong style="color: #4f46e5;">"{name}"</strong>.</p>
        <div class="card-info" style="border-left-color: #10b981; background-color: #ecfdf5;">
            <p style="margin: 0; color: #166534;">✅ Cette entité vient d'être officiellement ajoutée à la base de données MemoHub !</p>
        </div>
        {details_context}
        <p>Toute la communauté pourra désormais l'utiliser pour référencer ses travaux.</p>
        <div style="text-align: center; margin: 35px 0;">
            <a href="{settings.FRONTEND_URL}" class="btn">Retourner sur MemoHub</a>
        </div>
    """
    return get_base_layout(content, "Suggestion validée - MemoHub", f"Génial ! {name} a été ajouté à la plateforme.")

def get_suggestion_rejected_html(user_name: str, type_suggestion: str, name: str, reason: str) -> str:
    from app.core.config import settings
    label = "l'université" if type_suggestion == "university" else "la filière"
    
    content = f"""
        <h1>Mise à jour concernant votre suggestion</h1>
        <p>Bonjour <b>{user_name}</b>,</p>
        <p>Merci d'avoir suggéré {label} <strong>"{name}"</strong>.</p>
        <p>Après examen, nous n'avons pas pu valider cet ajout :</p>
        <div style="background-color: #fef2f2; border-radius: 12px; padding: 20px; border-left: 4px solid #ef4444; margin-bottom: 25px;">
            <p style="margin: 0; color: #b91c1c;"><strong>Motif :</strong> {reason}</p>
        </div>
        <p>Il se peut que l'entité existe déjà sous un nom différent ou ne réponde pas à nos critères actuels.</p>
        <div style="text-align: center; margin: 35px 0;">
            <a href="{settings.FRONTEND_URL}" class="btn" style="background-color: #374151;">Vers la plateforme</a>
        </div>
    """
    return get_base_layout(content, "Mise à jour suggestion - MemoHub", "Votre suggestion n'a pas pu être retenue.")

def get_role_promotion_html(user_name: str, new_role: str, details: str = "") -> str:
    from app.core.config import settings
    roles = { "admin": "Administrateur", "moderator": "Modérateur", "ambassador": "Ambassadeur", "student": "Étudiant" }
    role_label = roles.get(new_role, new_role)
    
    descriptions = {
        "admin": "Vous avez désormais un contrôle total sur la plateforme.",
        "moderator": f"Vous êtes promu modérateur{details}. Vous veillez à la qualité du référencement.",
        "ambassador": f"Félicitations Ambassadeur{details} ! Vous représentez votre établissement.",
        "student": "Votre compte a été configuré avec le rôle étudiant."
    }
    
    content = f"""
        <h1 style="color: #7c3aed;">Félicitations pour votre nouveau rôle !</h1>
        <p>Bonjour <b>{user_name}</b>,</p>
        <p>Nous avons le plaisir de vous informer que votre rôle sur MemoHub a évolué.</p>
        <div class="card-info" style="border-left-color: #7c3aed; background-color: #f5f3ff;">
            <p style="margin: 0; font-size: 18px; color: #7c3aed;"><strong>Nouveau Rôle : {role_label}</strong></p>
            <p style="margin: 10px 0 0 0; color: #6d28d9; font-size: 15px;">{descriptions.get(new_role, "")}</p>
        </div>
        <p>Vos nouveaux privilèges sont déjà actifs. Connectez-vous pour découvrir vos nouveaux outils.</p>
        <div style="text-align: center; margin: 35px 0;">
            <a href="{settings.FRONTEND_URL}" class="btn" style="background-color: #7c3aed;">Voir mon Dashboard</a>
        </div>
        <p>Merci pour votre engagement croissant à nos côtés !</p>
    """
    return get_base_layout(content, "Promotion de rôle - MemoHub", f"Félicitations, vous êtes désormais {role_label} !")
