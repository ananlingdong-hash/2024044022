from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path

from dotenv import dotenv_values, load_dotenv


BASE_DIR = Path(__file__).resolve().parents[1]
load_dotenv(BASE_DIR / ".env")
load_dotenv(BASE_DIR.parent / ".env", override=False)
backend_env = dotenv_values(BASE_DIR / ".env")
root_env = dotenv_values(BASE_DIR.parent / ".env")


def _first_non_empty(*values: str | None) -> str | None:
    for value in values:
        if value is None:
            continue
        cleaned = value.strip().strip('"').strip("'")
        if cleaned:
            return cleaned
    return None


@dataclass(frozen=True)
class Settings:
    app_name: str = "AstraQuant AI Backend"
    database_url: str = os.getenv("DATABASE_URL", "sqlite:///./backend/data/astrquant.db")
    cors_origins: list[str] = None  # type: ignore[assignment]
    minimax_api_key: str | None = _first_non_empty(
        os.getenv("MINIMAX_API_KEY"),
        backend_env.get("MINIMAX_API_KEY"),
        root_env.get("MINIMAX_API_KEY"),
    )
    minimax_model: str = _first_non_empty(
        os.getenv("MINIMAX_MODEL"),
        backend_env.get("MINIMAX_MODEL"),
        root_env.get("MINIMAX_MODEL"),
    ) or "MiniMax-M2.7"
    minimax_api_url: str = _first_non_empty(
        os.getenv("MINIMAX_API_URL"),
        backend_env.get("MINIMAX_API_URL"),
        root_env.get("MINIMAX_API_URL"),
    ) or "https://api.minimax.chat/v1/text/chatcompletion_v2"
    minimax_group_id: str | None = _first_non_empty(
        os.getenv("MINIMAX_GROUP_ID"),
        backend_env.get("MINIMAX_GROUP_ID"),
        root_env.get("MINIMAX_GROUP_ID"),
    )
    minimax_user_id: str | None = _first_non_empty(
        os.getenv("MINIMAX_USER_ID"),
        backend_env.get("MINIMAX_USER_ID"),
        root_env.get("MINIMAX_USER_ID"),
    )
    backtest_script_path: str = _first_non_empty(
        os.getenv("BACKTEST_SCRIPT_PATH"),
        backend_env.get("BACKTEST_SCRIPT_PATH"),
        root_env.get("BACKTEST_SCRIPT_PATH"),
    ) or r"D:\新建文件夹\quant\run_backtest.py"

    def __post_init__(self) -> None:
        object.__setattr__(self, "minimax_api_key", _first_non_empty(self.minimax_api_key))
        if self.cors_origins is None:
            object.__setattr__(
                self,
                "cors_origins",
                ["*"],
            )


settings = Settings()
