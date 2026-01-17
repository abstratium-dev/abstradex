-- Create partner type lookup table
CREATE TABLE T_partner_type (
    id VARCHAR(36) PRIMARY KEY,
    type_code VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    CONSTRAINT chk_type_code CHECK (type_code IN ('NATURAL_PERSON', 'LEGAL_ENTITY'))
);

-- Create index on type_code for faster lookups
CREATE INDEX idx_partner_type_code ON T_partner_type(type_code);
