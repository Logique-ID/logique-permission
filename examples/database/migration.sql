-- Logique Permission Database Migration
-- PostgreSQL Schema for RBAC System

-- Create database (run this separately)
-- CREATE DATABASE logique_permission;

-- Connect to the database
-- \c logique_permission;

-- Create permissions table
CREATE TABLE IF NOT EXISTS permissions (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    guard_name VARCHAR(255) NOT NULL DEFAULT 'web',
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(name, guard_name)
);

-- Create roles table
CREATE TABLE IF NOT EXISTS roles (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    guard_name VARCHAR(255) NOT NULL DEFAULT 'web',
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(name, guard_name)
);

-- Create role_permissions junction table
CREATE TABLE IF NOT EXISTS role_permissions (
    role_id VARCHAR(255) NOT NULL,
    permission_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
);

-- Create guards table
CREATE TABLE IF NOT EXISTS guards (
    name VARCHAR(255) PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create user_roles table
CREATE TABLE IF NOT EXISTS user_roles (
    user_id VARCHAR(255) NOT NULL,
    role_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

-- Create user_permissions table
CREATE TABLE IF NOT EXISTS user_permissions (
    user_id VARCHAR(255) NOT NULL,
    permission_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, permission_id),
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_permissions_guard_name ON permissions(guard_name);
CREATE INDEX IF NOT EXISTS idx_roles_guard_name ON roles(guard_name);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission_id ON role_permissions(permission_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_user_id ON user_permissions(user_id);

-- Insert default guard
INSERT INTO guards (name) VALUES ('web') ON CONFLICT (name) DO NOTHING;
INSERT INTO guards (name) VALUES ('api') ON CONFLICT (name) DO NOTHING;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_permissions_updated_at 
    BEFORE UPDATE ON permissions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_roles_updated_at 
    BEFORE UPDATE ON roles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample data (optional)
-- INSERT INTO permissions (id, name, guard_name, description) VALUES 
--     ('perm_1', 'edit-users', 'web', 'Can edit user information'),
--     ('perm_2', 'delete-users', 'web', 'Can delete users'),
--     ('perm_3', 'view-users', 'web', 'Can view user information');

-- INSERT INTO roles (id, name, guard_name, description) VALUES 
--     ('role_1', 'admin', 'web', 'Administrator role'),
--     ('role_2', 'moderator', 'web', 'Moderator role'),
--     ('role_3', 'user', 'web', 'Regular user role');

-- INSERT INTO role_permissions (role_id, permission_id) VALUES 
--     ('role_1', 'perm_1'),
--     ('role_1', 'perm_2'),
--     ('role_1', 'perm_3'),
--     ('role_2', 'perm_1'),
--     ('role_2', 'perm_3'),
--     ('role_3', 'perm_3');
