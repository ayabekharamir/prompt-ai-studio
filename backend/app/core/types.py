from sqlalchemy.types import TypeDecorator, CHAR, JSON
from sqlalchemy.dialects.postgresql import UUID as PG_UUID, JSONB
import uuid


class GUID(TypeDecorator):
    """
    Platform-independent GUID type.

    Uses PostgreSQL UUID when running on PostgreSQL,
    and CHAR(36) when running on databases like MySQL.
    """

    impl = CHAR
    cache_ok = True

    def load_dialect_impl(self, dialect):
        if dialect.name == "postgresql":
            return dialect.type_descriptor(PG_UUID())
        else:
            return dialect.type_descriptor(CHAR(36))

    def process_bind_param(self, value, dialect):
        if value is None:
            return None

        if dialect.name == "postgresql":
            return value

        if isinstance(value, uuid.UUID):
            return str(value)

        return str(value)

    def process_result_value(self, value, dialect):
        if value is None:
            return None

        if not isinstance(value, uuid.UUID):
            return uuid.UUID(value)

        return value


class JSONType(TypeDecorator):
    """
    Platform-independent JSON type.

    Uses PostgreSQL JSONB when running on PostgreSQL,
    and native JSON when running on databases like MySQL.
    """

    impl = JSON
    cache_ok = True

    def load_dialect_impl(self, dialect):
        if dialect.name == "postgresql":
            return dialect.type_descriptor(JSONB())
        else:
            return dialect.type_descriptor(JSON())
