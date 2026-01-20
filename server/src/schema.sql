-- Tabela de Usuários
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Bebês
CREATE TABLE IF NOT EXISTS babies (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  birth_date TEXT,
  gender TEXT,
  weight REAL,
  height REAL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Tabela de Eventos (Medicamentos, Amamentação, Sono)
CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  baby_id TEXT NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  details TEXT,
  date TEXT NOT NULL,
  duration TEXT,
  frequency TEXT,
  completed INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (baby_id) REFERENCES babies(id)
);

-- Tabela de Documentos Médicos
CREATE TABLE IF NOT EXISTS documents (
  id TEXT PRIMARY KEY,
  baby_id TEXT NOT NULL,
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  date TEXT,
  file_path TEXT, -- ID ou caminho no R2
  file_type TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (baby_id) REFERENCES babies(id)
);

-- Índices para Performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_babies_user ON babies(user_id);
CREATE INDEX IF NOT EXISTS idx_events_baby_date ON events(baby_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_documents_baby ON documents(baby_id);
