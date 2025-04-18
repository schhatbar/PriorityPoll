-- Basic database initialization for Priority Poll application

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    is_admin BOOLEAN NOT NULL DEFAULT FALSE
);

-- Polls table
CREATE TABLE IF NOT EXISTS polls (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    options JSONB NOT NULL,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    results JSONB
);

-- Votes table
CREATE TABLE IF NOT EXISTS votes (
    id SERIAL PRIMARY KEY,
    poll_id INTEGER REFERENCES polls(id),
    voter_name VARCHAR(255) NOT NULL,
    rankings JSONB NOT NULL,
    voted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User points table (for gamification)
CREATE TABLE IF NOT EXISTS user_points (
    id SERIAL PRIMARY KEY,
    voter_name VARCHAR(255) NOT NULL UNIQUE,
    points INTEGER NOT NULL DEFAULT 0,
    achievements JSONB,
    badges JSONB,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default admin user if not exists
-- username: admin, password: admin123
INSERT INTO users (username, password, is_admin)
VALUES ('admin', '9f3316c1c92bafe8bd1e3b2fa0e99e4aa01e2bfbb46467f3d3fb6fdc42c659a0.49b58f51b1fea9ff', TRUE)
ON CONFLICT (username) DO NOTHING;