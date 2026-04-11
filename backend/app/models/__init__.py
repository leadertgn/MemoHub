# app/models/__init__.py

# L'ordre d'import est important pour SQLModel :
# les modèles sans dépendances d'abord, puis ceux qui en ont.
from .refresh_token import RefreshTokenBlacklist
from .enums import UserRole, MemoirStatus, DegreeLevel, UniversityStatus, DomainStatus
from .base import TimestampMixin

from .user import User
from .country import Country
from .university import University
from .domain import Domain
from .field_of_study import FieldOfStudy
from .memoir import Memoir

from .application import TeamApplication

# Plus de Category — remplacée par Domain + FieldOfStudy
