-- 考研资料总库 · 统一账号（多方式登录）与云端学习数据同步表结构

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE,
  phone TEXT UNIQUE,
  name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT NOT NULL DEFAULT '',
  password_hash TEXT,
  email_verified INTEGER NOT NULL DEFAULT 0,
  phone_verified INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  last_login_at INTEGER
);

CREATE TABLE IF NOT EXISTS auth_identities (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  provider TEXT NOT NULL,
  provider_user_id TEXT NOT NULL,
  provider_email TEXT,
  provider_name TEXT,
  created_at INTEGER NOT NULL,
  UNIQUE(provider, provider_user_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_identities_user ON auth_identities(user_id);

CREATE TABLE IF NOT EXISTS verification_codes (
  id TEXT PRIMARY KEY,
  channel TEXT NOT NULL,
  target TEXT NOT NULL,
  purpose TEXT NOT NULL,
  code_hash TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  used_at INTEGER,
  ip TEXT,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_codes_target ON verification_codes(channel, target, created_at DESC);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  user_agent TEXT,
  ip TEXT,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  last_seen_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_exp ON sessions(expires_at);

CREATE TABLE IF NOT EXISTS user_kv (
  user_id TEXT NOT NULL,
  storage_key TEXT NOT NULL,
  value TEXT,
  deleted INTEGER NOT NULL DEFAULT 0,
  updated_at INTEGER NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (user_id, storage_key),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_user_kv_sync ON user_kv(user_id, updated_at);
