-- New database schema (PostgreSQL) for AI stock platform MVP

create table if not exists users (
  id uuid primary key,
  email varchar(128) unique not null,
  nickname varchar(64),
  created_at timestamptz default now()
);

create table if not exists user_credentials (
  user_id uuid primary key references users(id),
  password_hash varchar(128) not null,
  updated_at timestamptz default now()
);

create table if not exists user_sessions (
  token varchar(64) primary key,
  user_id uuid not null references users(id),
  created_at timestamptz default now()
);

create table if not exists user_watchlists (
  user_id uuid primary key references users(id),
  symbols jsonb not null,
  updated_at timestamptz default now()
);

create table if not exists api_keys (
  id uuid primary key,
  user_id uuid not null references users(id),
  provider varchar(32) not null,
  encrypted_key text not null,
  created_at timestamptz default now()
);

create table if not exists sentiment_reports (
  id varchar(32) primary key,
  user_id uuid not null references users(id),
  symbols jsonb not null,
  market_sentiment int not null,
  summary text not null,
  stock_scores jsonb not null,
  suggestion text not null,
  generated_at timestamptz not null
);

create table if not exists strategy_backtests (
  id uuid primary key,
  user_id uuid not null references users(id),
  strategy_name varchar(128) not null,
  input_code text not null,
  win_rate numeric(6, 3) not null,
  annual_return numeric(8, 3) not null,
  sharpe numeric(8, 3) not null,
  max_drawdown numeric(8, 3) not null,
  created_at timestamptz default now()
);

create table if not exists monitor_tasks (
  id uuid primary key,
  user_id uuid not null references users(id),
  name varchar(64) not null,
  cron_expr varchar(64) not null,
  enabled int not null default 1,
  created_at timestamptz default now()
);
