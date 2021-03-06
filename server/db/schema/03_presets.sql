-- Drop and recreate Presets table
DROP TABLE IF EXISTS presets CASCADE;

CREATE TABLE presets (
  id SERIAL PRIMARY KEY NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  image_url TEXT,
  audio_features JSON NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE
);
