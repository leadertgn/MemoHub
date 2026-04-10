from sqlmodel import Session, select
from app.models import User, University, FieldOfStudy, Memoir
from app.models.enums import UserRole
from app.services.email_service import send_email_async, get_base_layout

def get_team_notification_html(resource_type: str, resource_name: str, action: str, details: str = "") -> str:
    from app.core.config import settings
    
    content = f"""
        <h1 style="color: #2563eb;">Alerte Modération : {action}</h1>
        <p>Bonjour,</p>
        <p>Une nouvelle activité nécessitant votre attention a été détectée sur la plateforme MemoHub.</p>
        
        <div class="card-info" style="border-left-color: #2563eb; background-color: #f0f9ff;">
            <div style="margin-bottom: 12px;">
                <span class="label-item">TYPE DE RESSOURCE</span>
                <span class="value-item">{resource_type}</span>
            </div>
            <div style="margin-bottom: 12px;">
                <span class="label-item">NOM / TITRE</span>
                <span class="value-item">{resource_name}</span>
            </div>
            {f'<div><span class="label-item">DÉTAILS</span><span class="value-item">{details}</span></div>' if details else ''}
        </div>
        
        <p>Merci de vous connecter au panel d'administration pour traiter cette demande dans les meilleurs délais.</p>
        
        <div style="text-align: center; margin: 35px 0;">
            <a href="{settings.FRONTEND_URL}/" class="btn" style="background-color: #1e293b;">Accéder au Dashboard</a>
        </div>
        
        <p><i>Ceci est une notification automatique générée par le système de surveillance MemoHub.</i></p>
    """
    return get_base_layout(content, f"[Alerte] {action} - MemoHub", "Une nouvelle demande de modération est en attente.")


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
