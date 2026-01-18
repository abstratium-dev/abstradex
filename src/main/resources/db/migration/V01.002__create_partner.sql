-- Create partner base table
-- Note: partner_number_seq will be managed by application code, not database auto-increment
-- This approach works across MySQL, PostgreSQL, H2, and MS SQL
CREATE TABLE T_partner (
    id VARCHAR(36) PRIMARY KEY,
    partner_number_seq BIGINT NOT NULL UNIQUE,
    partner_type_id VARCHAR(36),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    notes TEXT,
    CONSTRAINT fk_partner_type FOREIGN KEY (partner_type_id) REFERENCES T_partner_type(id)
);

-- Create a separate table to track the next partner number
-- This works across all database types
CREATE TABLE T_partner_sequence (
    id INT PRIMARY KEY,
    next_val BIGINT NOT NULL
);

-- Initialize the sequence
INSERT INTO T_partner_sequence (id, next_val) VALUES (1, 1);

-- Create indices for common queries
CREATE INDEX idx_partner_number_seq ON T_partner(partner_number_seq);
CREATE INDEX idx_partner_type_id ON T_partner(partner_type_id);
CREATE INDEX idx_partner_active ON T_partner(is_active);
CREATE INDEX idx_partner_created_at ON T_partner(created_at);
