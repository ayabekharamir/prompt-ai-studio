"""
Alembic environment configuration.

Wired to the application's own settings (app.core.config.settings) so that
DATABASE_URL is read from the same .env / environment variables the FastAPI
app uses - no separate configuration to keep in sync.

Target metadata is app.core.database.Base, which every model in app/models
registers itself against on import (see the `import app.models` block below).
This is what powers `alembic revision --autogenerate`.
"""

import os
import sys
from logging.config import fileConfig

from alembic import context
from sqlalchemy import engine_from_config, pool

# Make "app" importable when alembic is run from the backend/ directory.
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.config import settings  # noqa: E402
from app.core.database import Base  # noqa: E402

# Import every model module so they register their tables on Base.metadata
# before autogenerate compares against the database.
from app.models import (  # noqa: E402, F401
    user,
    workspace,
    brand,
    brand_identity,
    brand_rules,
    brand_asset,
    product_template,
    product,
    persona_template,
    persona,
    prompt_template,
    prompt,
    prompt_execution,
)

# this is the Alembic Config object, which provides access to values within
# the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Inject the application's DATABASE_URL (from .env / environment) so a
# single source of truth drives both the app and migrations.
config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode (emits SQL script, no DB connection)."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode (opens a live DB connection)."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
