-- Drop and recreate Weekly Updated Playlists table
DROP TABLE IF EXISTS weekly_updated_playlists CASCADE;

CREATE TABLE weekly_updated_playlists (
  playlist_id VARCHAR(255) PRIMARY KEY NOT NULL UNIQUE,
  audio_features JSON NOT NULL,
  created_at DATE NOT NULL,
  removed_at DATE DEFAULT NULL,
  user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE
);