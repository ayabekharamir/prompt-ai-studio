"""
Ensures every SQLAlchemy model is imported (and therefore registered
with the ORM mapper registry) before any relationship() that refers to
another model by class name (e.g. relationship("BrandAsset")) gets
resolved.

Without this, SQLAlchemy can fail with errors like:

    sqlalchemy.exc.InvalidRequestError: When initializing mapper
    Mapper[Brand(brands)], expression 'BrandAsset' failed to locate a
    name ('BrandAsset').

...because Python never actually imported/executed brand_asset.py, so
the BrandAsset class was never registered.

Import order does not matter here - relationship() lookups by string
name are resolved lazily, so all we need is for every module below to
have been imported at least once before the app starts handling
requests.
"""

from app.models import base  # noqa: F401
from app.models import user  # noqa: F401
from app.models import workspace  # noqa: F401
from app.models import brand  # noqa: F401
from app.models import brand_identity  # noqa: F401
from app.models import brand_rules  # noqa: F401
from app.models import brand_asset  # noqa: F401
from app.models import product_template  # noqa: F401
from app.models import product  # noqa: F401
from app.models import persona_template  # noqa: F401
from app.models import persona  # noqa: F401
from app.models import prompt_template  # noqa: F401
from app.models import prompt  # noqa: F401
from app.models import prompt_execution  # noqa: F401
