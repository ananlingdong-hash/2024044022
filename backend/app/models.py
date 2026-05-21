from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email: Mapped[str] = mapped_column(String(128), unique=True)
    nickname: Mapped[str | None] = mapped_column(String(64), nullable=True)
    role: Mapped[str] = mapped_column(String(32), default="viewer")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class UserCredential(Base):
    __tablename__ = "user_credentials"

    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), primary_key=True)
    password_hash: Mapped[str] = mapped_column(String(128))
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class UserSession(Base):
    __tablename__ = "user_sessions"

    token: Mapped[str] = mapped_column(String(64), primary_key=True)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class UserWatchlist(Base):
    __tablename__ = "user_watchlists"

    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), primary_key=True)
    symbols: Mapped[str] = mapped_column(Text)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class ApiKey(Base):
    __tablename__ = "api_keys"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), index=True)
    provider: Mapped[str] = mapped_column(String(32))
    encrypted_key: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class SentimentReport(Base):
    __tablename__ = "sentiment_reports"

    id: Mapped[str] = mapped_column(String(32), primary_key=True)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), index=True)
    symbols: Mapped[str] = mapped_column(Text)
    market_sentiment: Mapped[int] = mapped_column(Integer)
    summary: Mapped[str] = mapped_column(Text)
    stock_scores: Mapped[str] = mapped_column(Text)
    suggestion: Mapped[str] = mapped_column(Text)
    generated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class StrategyBacktest(Base):
    __tablename__ = "strategy_backtests"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), index=True)
    strategy_name: Mapped[str] = mapped_column(String(128))
    input_code: Mapped[str] = mapped_column(Text)
    win_rate: Mapped[float] = mapped_column(Float)
    annual_return: Mapped[float] = mapped_column(Float)
    max_drawdown: Mapped[float] = mapped_column(Float)
    sharpe: Mapped[float] = mapped_column(Float)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class MonitorTask(Base):
    __tablename__ = "monitor_tasks"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), index=True)
    name: Mapped[str] = mapped_column(String(64))
    cron_expr: Mapped[str] = mapped_column(String(64))
    enabled: Mapped[int] = mapped_column(Integer, default=1)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class RiskEvent(Base):
    __tablename__ = "risk_events"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    type: Mapped[str] = mapped_column(String(32))
    severity: Mapped[str] = mapped_column(String(16))
    region: Mapped[str] = mapped_column(String(64))
    lat: Mapped[float] = mapped_column(Float, default=0.0)
    lng: Mapped[float] = mapped_column(Float, default=0.0)
    description: Mapped[str] = mapped_column(Text)
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class Strategy(Base):
    __tablename__ = "strategies"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String(128))
    type: Mapped[str] = mapped_column(String(32))
    params_json: Mapped[str] = mapped_column(Text)
    cost: Mapped[float] = mapped_column(Float, default=0.0)
    residual_risk: Mapped[float] = mapped_column(Float, default=0.0)
    status: Mapped[str] = mapped_column(String(32), default="pending")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class KpiLog(Base):
    __tablename__ = "kpi_logs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    kpi_name: Mapped[str] = mapped_column(String(64))
    actual: Mapped[float] = mapped_column(Float)
    target: Mapped[float] = mapped_column(Float)
    threshold: Mapped[float] = mapped_column(Float)
    period: Mapped[str] = mapped_column(String(32))
    recorded_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class FeedbackRecord(Base):
    __tablename__ = "feedback_records"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    strategy_id: Mapped[str] = mapped_column(String(36), index=True)
    plan_params: Mapped[str] = mapped_column(Text)
    actual_loss: Mapped[float] = mapped_column(Float, default=0.0)
    actual_cost: Mapped[float] = mapped_column(Float, default=0.0)
    residual_risk: Mapped[float] = mapped_column(Float, default=0.0)
    suggestions: Mapped[str] = mapped_column(Text)
    recorded_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
