-- Create address detail table (links partners to addresses)
CREATE TABLE T_address_detail (
    id VARCHAR(36) PRIMARY KEY,
    partner_id VARCHAR(36) NOT NULL,
    address_id VARCHAR(36) NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    address_type VARCHAR(50),
    valid_from TIMESTAMP,
    valid_to TIMESTAMP,
    CONSTRAINT fk_address_detail_partner FOREIGN KEY (partner_id) REFERENCES T_partner(id) ON DELETE CASCADE,
    CONSTRAINT fk_address_detail_address FOREIGN KEY (address_id) REFERENCES T_address(id) ON DELETE CASCADE,
    CONSTRAINT chk_address_type CHECK (address_type IN ('BILLING', 'SHIPPING'))
);

-- Create indices for common queries
CREATE INDEX idx_address_detail_partner ON T_address_detail(partner_id);
CREATE INDEX idx_address_detail_address ON T_address_detail(address_id);
CREATE INDEX idx_address_detail_primary ON T_address_detail(partner_id, is_primary);
CREATE INDEX idx_address_detail_type ON T_address_detail(address_type);
CREATE INDEX idx_address_detail_validity ON T_address_detail(valid_from, valid_to);
