"""
Local filesystem StorageProvider implementation.

Writes/reads files under a single configurable root directory
(settings.STORAGE_LOCAL_PATH). Works unmodified on any Linux host - no
cloud-specific APIs - which is what makes it suitable both for local
development and for a plain VPS/hosting target such as Miznbanfa.

In production this root directory MUST be a persistent, writable path
(e.g. a mounted volume) - otherwise uploaded files are lost whenever the
container/process restarts or is redeployed. See STORAGE_LOCAL_PATH in
app/core/config.py and the Docker notes in backend/Dockerfile.
"""

import os

from app.services.storage.base import StorageProviderBase


class LocalFilesystemStorageProvider(StorageProviderBase):
    def __init__(self, base_path: str):
        self.base_path = os.path.abspath(base_path)

    def _resolve(self, storage_key: str) -> str:
        # Normalize and ensure the resolved path can never escape base_path
        # (defense in depth - storage_key is always server-generated, but
        # this keeps the provider safe even if that ever changes).
        full_path = os.path.abspath(os.path.join(self.base_path, storage_key))
        if not full_path.startswith(self.base_path + os.sep) and full_path != self.base_path:
            raise ValueError(f"Invalid storage_key (path escapes storage root): {storage_key!r}")
        return full_path

    def save(self, storage_key: str, content: bytes) -> None:
        full_path = self._resolve(storage_key)
        os.makedirs(os.path.dirname(full_path), exist_ok=True)
        with open(full_path, "wb") as f:
            f.write(content)

    def read(self, storage_key: str) -> bytes:
        full_path = self._resolve(storage_key)
        if not os.path.isfile(full_path):
            raise FileNotFoundError(f"No object at storage_key: {storage_key!r}")
        with open(full_path, "rb") as f:
            return f.read()

    def delete(self, storage_key: str) -> None:
        full_path = self._resolve(storage_key)
        try:
            os.remove(full_path)
        except FileNotFoundError:
            pass
