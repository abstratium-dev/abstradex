-- Create relationship type table
CREATE TABLE T_relationship_type (
    id VARCHAR(36) PRIMARY KEY,
    type_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    color_hex VARCHAR(7),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create index for active relationship types
CREATE INDEX idx_relationship_type_active ON T_relationship_type(is_active);
CREATE INDEX idx_relationship_type_name ON T_relationship_type(type_name);

-- Insert some default relationship types
INSERT INTO T_relationship_type (id, type_name, description, color_hex, is_active) VALUES
    (UUID(), 'is parent company of', 'Parent company relationship', '#1976d2', TRUE),
    (UUID(), 'is subsidiary of', 'Subsidiary company relationship', '#388e3c', TRUE),
    (UUID(), 'is employee of', 'Employee relationship', '#f57c00', TRUE),
    (UUID(), 'is authorized representative of', 'Authorized representative', '#7b1fa2', TRUE),
    (UUID(), 'is business partner of', 'Business partner relationship', '#0288d1', TRUE),
    (UUID(), 'is referral of', 'Referral relationship', '#c2185b', TRUE),
    (UUID(), 'is affiliated with', 'Affiliated entity', '#5d4037', TRUE);
