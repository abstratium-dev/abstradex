-- Create SME relationship table (customer/supplier relationships)
CREATE TABLE T_sme_relationship (
    id VARCHAR(36) PRIMARY KEY,
    partner_id VARCHAR(36) NOT NULL,
    relationship_type VARCHAR(50),
    status VARCHAR(50),
    relationship_start DATE,
    relationship_end DATE,
    payment_terms VARCHAR(255),
    credit_limit VARCHAR(50),
    priority_level INT,
    account_manager VARCHAR(100),
    CONSTRAINT fk_sme_relationship_partner FOREIGN KEY (partner_id) REFERENCES T_partner(id) ON DELETE CASCADE,
    CONSTRAINT chk_relationship_type CHECK (relationship_type IN ('CUSTOMER', 'SUPPLIER', 'BOTH')),
    CONSTRAINT chk_status CHECK (status IN ('ACTIVE', 'INACTIVE', 'PROSPECT', 'FORMER', 'SUSPENDED'))
);

-- Create indices for common queries
CREATE INDEX idx_sme_relationship_partner ON T_sme_relationship(partner_id);
CREATE INDEX idx_sme_relationship_type ON T_sme_relationship(relationship_type);
CREATE INDEX idx_sme_relationship_status ON T_sme_relationship(status);
CREATE INDEX idx_sme_relationship_account_manager ON T_sme_relationship(account_manager);
CREATE INDEX idx_sme_relationship_dates ON T_sme_relationship(relationship_start, relationship_end);
