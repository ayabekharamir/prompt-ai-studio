"""
Shared base mixin for models: UUID primary key + timestamps.
"""

import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, DateTime

from app.core.database import Base
from app.core.types import GUID


class BaseModel(Base):
    __abstract__ = True

    id = Column(GUID(), primary_key=True, default=uuid.uuid4, index=True)

    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )

    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )
