CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS ai_knowledge (
  id UUID PRIMARY KEY,
  source_type TEXT NOT NULL,
  source_id TEXT,
  content TEXT NOT NULL,
  embedding vector(1536),
  created_at TIMESTAMP DEFAULT NOW()
);
