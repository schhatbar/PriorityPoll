-- Create database tables if they don't exist

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(200) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Polls table
CREATE TABLE IF NOT EXISTS polls (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    options JSONB NOT NULL,
    created_by INTEGER REFERENCES users(id),
    active BOOLEAN DEFAULT TRUE,
    results JSONB
);

-- Votes table
CREATE TABLE IF NOT EXISTS votes (
    id SERIAL PRIMARY KEY,
    poll_id INTEGER NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
    voter_name VARCHAR(100) NOT NULL,
    rankings JSONB NOT NULL
);

-- User points table
CREATE TABLE IF NOT EXISTS user_points (
    id SERIAL PRIMARY KEY,
    voter_name VARCHAR(100) NOT NULL UNIQUE,
    points INTEGER DEFAULT 0,
    achievements JSONB DEFAULT '[]'::jsonb,
    badges JSONB DEFAULT '[]'::jsonb
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS votes_poll_id_idx ON votes(poll_id);
CREATE INDEX IF NOT EXISTS votes_voter_name_idx ON votes(voter_name);
CREATE INDEX IF NOT EXISTS user_points_voter_name_idx ON user_points(voter_name);

-- Create default admin user if it doesn't exist
INSERT INTO users (username, password, role)
VALUES (
    'admin', 
    '14c08c6253283cab1c7dd20fce957ca5f4d94cab6d5361c9ef9fbd5062f0955f.46e7438724017147bc39d9f86ddf42e0', -- admin123
    'admin'
)
ON CONFLICT (username) DO NOTHING;