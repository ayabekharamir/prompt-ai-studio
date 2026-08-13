"""
Storage provider factory.

Selects the active StorageProvider based on settings.STORAGE_PROVIDER, so
callers (services/API routes) never import a concrete provider class
directly. To move Brand Assets to S3-compatible object storage later
(e.g. R2, Arvan Cloud, Liara, MinIO, ...), add a new provider module here
and switch STORAGE_PROVIDER - no change needed in brand_asset_service,
the API routes, brand_assets DB model, or the frontend.
"""

from app.core.config import settings
from app.services.storage.base import StorageProviderBase

_SUPPORTED_PROVIDERS = {"local"}


def get_storage_provider() -> StorageProviderBase:
    provider = (settings.STORAGE_PROVIDER or "local").strip().lower()

    if provider == "local":
        from app.services.storage.local_provider import LocalFilesystemStorageProvider

        return LocalFilesystemStorageProvider(base_path=settings.STORAGE_LOCAL_PATH)

    # Placeholder for a future S3-compatible provider. Intentionally not
    # implemented in this phase (no external storage dependency has been
    # decided on yet for the production host) - wiring it in later is a
    # one-file addition (e.g. app/services/storage/s3_provider.py) plus a
    # branch here.
    raise ValueError(
        f"Unsupported STORAGE_PROVIDER: '{provider}'. Supported providers: "
        f"{sorted(_SUPPORTED_PROVIDERS)}."
    )
