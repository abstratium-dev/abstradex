-- Create contact detail table
CREATE TABLE T_contact_detail (
    id VARCHAR(36) PRIMARY KEY,
    partner_id VARCHAR(36) NOT NULL,
    contact_type VARCHAR(50),
    contact_value VARCHAR(255),
    label VARCHAR(100),
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_contact_detail_partner FOREIGN KEY (partner_id) REFERENCES T_partner(id) ON DELETE CASCADE,
    CONSTRAINT chk_contact_type CHECK (contact_type IN ('EMAIL', 'PHONE', 'MOBILE', 'FAX', 'WEBSITE', 'LINKEDIN', 'OTHER'))
);

-- Create indices for common queries
CREATE INDEX idx_contact_detail_partner ON T_contact_detail(partner_id);
CREATE INDEX idx_contact_detail_type ON T_contact_detail(contact_type);
CREATE INDEX idx_contact_detail_primary ON T_contact_detail(partner_id, is_primary);
CREATE INDEX idx_contact_detail_verified ON T_contact_detail(is_verified);
CREATE INDEX idx_contact_detail_value ON T_contact_detail(contact_value);
