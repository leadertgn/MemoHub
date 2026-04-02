from sqlmodel import Session, select
from app.models import User, University, FieldOfStudy, Memoir
from app.models.enums import UserRole
from app.services.email_service import send_email_async
from fastapi import BackgroundTasks

def get_team_notification_html(resource_type: str, resource_name: str, action: str, details: str = "") -> str:
    from app.core.config import settings
    return f"""
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #2563eb;">Nouvelle activité en attente : {action}</h2>
        <p>Bonjour,</p>
        <p>Une nouvelle demande nécessitant votre attention vient d'être générée sur le portail.</p>
        <div style="background-color: #f8fafc; padding: 15px; border-left: 4px solid #3b82f6; margin: 15px 0;">
            <p style="margin: 0;"><b>Type de Ressource :</b> {resource_type}</p>
            <p style="margin: 5px 0 0 0;"><b>Nom / Titre :</b> {resource_name}</p>
            {f'<p style="margin: 5px 0 0 0;"><b>Détails :</b> {details}</p>' if details else ''}
        </div>
        <p>Connectez-vous au <a href="{settings.FRONTEND_URL}/" style="color: #2563eb; font-weight: bold;">Dashboard Administrateur</a> pour prendre une décision (Valider ou Rejeter).</p>
        <br/>
        <p>L'équipe technique MemoHub</p>
      </body>
    </html>
    """

def notify_team_for_action(
    session: Session, 
    background_tasks: BackgroundTasks, 
    resource_type: str, 
    resource_name: str, 
    action: str, 
    country_id: int = None, 
    university_id: int = None,
    details: str = ""
):
    """
    Détermine l'audience cible de modérateurs (Admin inclus d'office) 
    qui doit recevoir une notification par email.
    """
    # Récupérer tous les admins (ils reçoivent TOUT)
    admins = session.exec(select(User).where(User.role == UserRole.admin)).all()
    recipients = {admin.email: admin.full_name for admin in admins if admin.email}

    # Ajouter le modérateur du pays concerné
    if country_id:
        moderators = session.exec(
            select(User).where(User.role == UserRole.moderator, User.country_id == country_id)
        ).all()
        for mod in moderators:
            if mod.email:
                recipients[mod.email] = mod.full_name

    # Ajouter l'ambassadeur de l'université concernée
    if university_id:
        ambassadors = session.exec(
            select(User).where(User.role == UserRole.ambassador, User.university_id == university_id)
        ).all()
        for amb in ambassadors:
            if amb.email:
                recipients[amb.email] = amb.full_name

    # Envoi asynchrone pour chaque destinataire
    html_content = get_team_notification_html(resource_type, resource_name, action, details)
    for email, name in recipients.items():
        background_tasks.add_task(
            send_email_async,
            to_email=email,
            to_name=name,
            subject=f"[Alerte Modération MemoHub] {action}",
            html_content=html_content
        )
