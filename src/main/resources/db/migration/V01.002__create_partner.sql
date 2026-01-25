-- Create partner table using SINGLE_TABLE inheritance strategy
-- All fields from NaturalPerson and LegalEntity are in this table
-- partner_type discriminator column determines the entity type
CREATE TABLE T_partner (
    id VARCHAR(36) PRIMARY KEY,
    partner_number_seq BIGINT NOT NULL UNIQUE,
    partner_type VARCHAR(20) NOT NULL, -- Discriminator: 'NATURAL_PERSON' or 'LEGAL_ENTITY'
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    notes TEXT,
    
    -- Natural Person fields (nullable for Legal Entity)
    title VARCHAR(50),
    first_name VARCHAR(100),
    middle_name VARCHAR(100),
    last_name VARCHAR(100),
    date_of_birth DATE,
    tax_id_np VARCHAR(50), -- Renamed to avoid conflict with legal entity tax_id
    preferred_language VARCHAR(10),
    
    -- Legal Entity fields (nullable for Natural Person)
    legal_name VARCHAR(255),
    trading_name VARCHAR(255),
    registration_number VARCHAR(100),
    tax_id VARCHAR(50),
    legal_form VARCHAR(50),
    incorporation_date DATE,
    jurisdiction VARCHAR(100)
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
CREATE INDEX idx_partner_type ON T_partner(partner_type);
CREATE INDEX idx_partner_active ON T_partner(is_active);
CREATE INDEX idx_partner_created_at ON T_partner(created_at);
CREATE INDEX idx_partner_last_name ON T_partner(last_name);
CREATE INDEX idx_partner_legal_name ON T_partner(legal_name);
