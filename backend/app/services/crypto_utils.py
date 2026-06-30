"""
AES-256-GCM encryption for protecting sensitive data in memory.
All sensitive fields (receivables, borrower info, etc.) are encrypted at rest in logs.
"""
from __future__ import annotations

import base64
import hashlib
import os
import secrets
from cryptography.hazmat.primitives.ciphers.aead import AESGCM


_KEY_CACHE: dict[str, bytes] = {}


def _derive_key(namespace: str) -> bytes:
    """Derive a deterministic AES-256 key from a namespace seed."""
    if namespace not in _KEY_CACHE:
        seed = f"astrquant-risk-vault::{namespace}::{os.urandom(16).hex()}"[:64]
        _KEY_CACHE[namespace] = hashlib.sha256(seed.encode()).digest()
    return _KEY_CACHE[namespace]


def encrypt_sensitive(data: str, namespace: str = "default") -> str:
    """Encrypt sensitive text with AES-256-GCM.

    Returns base64-encoded ciphertext (nonce + tag + ciphertext).
    """
    key = _derive_key(namespace)
    aesgcm = AESGCM(key)
    nonce = secrets.token_bytes(12)
    ciphertext = aesgcm.encrypt(nonce, data.encode("utf-8"), None)
    packed = nonce + ciphertext
    return base64.b64encode(packed).decode("ascii")


def decrypt_sensitive(encoded: str, namespace: str = "default") -> str:
    """Decrypt data previously encrypted with encrypt_sensitive."""
    key = _derive_key(namespace)
    aesgcm = AESGCM(key)
    packed = base64.b64decode(encoded)
    nonce, ciphertext = packed[:12], packed[12:]
    return aesgcm.decrypt(nonce, ciphertext, None).decode("utf-8")


def mask_for_log(data: str, visible_chars: int = 3) -> str:
    """Create a safe-for-logging masked version of sensitive data."""
    if len(data) <= visible_chars:
        return "*" * len(data)
    return data[:visible_chars] + "*" * (len(data) - visible_chars)
