"""
Storage Provider interface.

Brand Assets are stored as binary files (never inside PostgreSQL - the
database only ever holds metadata, see app/models/brand_asset.py). Any
storage backend (local filesystem, S3-compatible object storage, ...)
implements this interface, keeping provider-specific details out of
services and API routes - callers only ever see save() / read() / delete().

This mirrors the existing app/services/ai provider-abstraction pattern
(AIProviderBase + factory) used elsewhere in the codebase.

Deployment note: PAS's production target is not fixed to any specific
cloud (e.g. it may run on a plain Linux host such as Miznbanfa rather than
Railway/Cloudflare/Supabase). Storage keys are therefore simple relative
paths (e.g. "brand-assets/{brand_id}/{asset_id}/{filename}") that any
provider - local disk today, S3-compatible object storage later - can use
without any change to callers.
"""

from abc import ABC, abstractmethod


class StorageProviderBase(ABC):
    """Abstract base class for object storage providers."""

    @abstractmethod
    def save(self, storage_key: str, content: bytes) -> None:
        """
        Persist `content` under `storage_key`.

        Args:
            storage_key: Relative, tenant-scoped path, e.g.
                "brand-assets/{brand_id}/{asset_id}/{filename}".
            content: Raw file bytes.

        Raises:
            Exception: provider/IO errors are propagated to the caller.
        """
        raise NotImplementedError

    @abstractmethod
    def read(self, storage_key: str) -> bytes:
        """
        Read back the raw bytes stored under `storage_key`.

        Raises:
            FileNotFoundError: if no object exists at `storage_key`.
        """
        raise NotImplementedError

    @abstractmethod
    def delete(self, storage_key: str) -> None:
        """
        Delete the object at `storage_key`.

        Must not raise if the object is already missing (idempotent
        delete), so callers can safely retry cleanup.
        """
        raise NotImplementedError
