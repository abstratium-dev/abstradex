-- Create partner base table
CREATE TABLE T_partner (
    id VARCHAR(36) PRIMARY KEY,
    partner_number VARCHAR(100) NOT NULL UNIQUE,
    partner_type_id VARCHAR(36),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    notes TEXT,
    CONSTRAINT fk_partner_type FOREIGN KEY (partner_type_id) REFERENCES T_partner_type(id)
);

-- Create indices for common queries
CREATE INDEX idx_partner_number ON T_partner(partner_number);
CREATE INDEX idx_partner_type_id ON T_partner(partner_type_id);
CREATE INDEX idx_partner_active ON T_partner(is_active);
CREATE INDEX idx_partner_created_at ON T_partner(created_at);
