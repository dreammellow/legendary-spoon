-- Initialize the database with required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create the database if it doesn't exist (this is handled by POSTGRES_DB)
-- The database will be created automatically by PostgreSQL
