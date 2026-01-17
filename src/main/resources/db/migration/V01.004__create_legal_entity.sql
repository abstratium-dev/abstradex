-- Create legal entity table (extends partner)
CREATE TABLE T_legal_entity (
    partner_id VARCHAR(36) PRIMARY KEY,
    legal_name VARCHAR(255),
    trading_name VARCHAR(255),
    registration_number VARCHAR(100),
    tax_id VARCHAR(50),
    legal_form VARCHAR(50),
    incorporation_date DATE,
    jurisdiction VARCHAR(100),
    CONSTRAINT fk_legal_entity_partner FOREIGN KEY (partner_id) REFERENCES T_partner(id) ON DELETE CASCADE
);

-- Create indices for common queries
CREATE INDEX idx_legal_entity_legal_name ON T_legal_entity(legal_name);
CREATE INDEX idx_legal_entity_trading_name ON T_legal_entity(trading_name);
CREATE INDEX idx_legal_entity_registration_number ON T_legal_entity(registration_number);
CREATE INDEX idx_legal_entity_tax_id ON T_legal_entity(tax_id);
