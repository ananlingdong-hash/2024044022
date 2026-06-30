"""
Async cache manager with dynamic TTL by data source type.
Thread-safe, with automatic cleanup of expired entries.
"""
from __future__ import annotations

import threading
import time
from typing import Any, Callable


class CacheEntry:
    __slots__ = ("value", "expires_at", "fetched_at")

    def __init__(self, value: Any, ttl_seconds: float) -> None:
        now = time.time()
        self.value = value
        self.expires_at = now + ttl_seconds
        self.fetched_at = now

    @property
    def is_expired(self) -> bool:
        return time.time() > self.expires_at


class CacheManager:
    """Thread-safe in-memory cache with per-key TTL."""

    def __init__(self) -> None:
        self._store: dict[str, CacheEntry] = {}
        self._lock = threading.Lock()
        self._default_ttl = 60.0

    def get(self, key: str) -> Any | None:
        with self._lock:
            entry = self._store.get(key)
            if entry is None:
                return None
            if entry.is_expired:
                del self._store[key]
                return None
            return entry.value

    def set(self, key: str, value: Any, ttl: float | None = None) -> None:
        with self._lock:
            self._store[key] = CacheEntry(value, ttl if ttl is not None else self._default_ttl)

    def get_or_compute(self, key: str, computer: Callable[[], Any], ttl: float | None = None) -> Any:
        """Get cached value or compute + cache it atomically."""
        with self._lock:
            entry = self._store.get(key)
            if entry is not None and not entry.is_expired:
                return entry.value

        # Compute outside lock to avoid blocking
        value = computer()

        with self._lock:
            self._store[key] = CacheEntry(value, ttl if ttl is not None else self._default_ttl)

        return value

    def invalidate(self, key: str) -> None:
        with self._lock:
            self._store.pop(key, None)

    def cleanup_expired(self) -> int:
        """Remove all expired entries. Returns number removed."""
        with self._lock:
            expired = [k for k, v in self._store.items() if v.is_expired]
            for k in expired:
                del self._store[k]
            return len(expired)

    def stats(self) -> dict[str, Any]:
        with self._lock:
            now = time.time()
            total = len(self._store)
            expired = sum(1 for v in self._store.values() if v.is_expired)
            return {
                "total_entries": total,
                "expired_entries": expired,
                "active_entries": total - expired,
            }


# Global cache instances with different TTL defaults
_fx_cache = CacheManager()
_fx_cache._default_ttl = 1.0  # 1 second for FX rates

_benchmark_cache = CacheManager()
_benchmark_cache._default_ttl = 3600.0  # 1 hour for benchmarks

_credit_cache = CacheManager()
_credit_cache._default_ttl = 300.0  # 5 minutes for credit data

_supply_cache = CacheManager()
_supply_cache._default_ttl = 600.0  # 10 minutes for supply chain


def get_fx_cache() -> CacheManager:
    return _fx_cache


def get_benchmark_cache() -> CacheManager:
    return _benchmark_cache


def get_credit_cache() -> CacheManager:
    return _credit_cache


def get_supply_cache() -> CacheManager:
    return _supply_cache
