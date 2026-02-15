-- Create partner relationship table (partner-to-partner relationships)
CREATE TABLE T_partner_relationship (
    id VARCHAR(36) PRIMARY KEY,
    from_partner_id VARCHAR(36) NOT NULL,
    to_partner_id VARCHAR(36) NOT NULL,
    relationship_type_id VARCHAR(36),
    effective_from DATE,
    effective_to DATE,
    notes TEXT,
    CONSTRAINT fk_partner_rel_from FOREIGN KEY (from_partner_id) REFERENCES T_partner(id) ON DELETE CASCADE,
    CONSTRAINT fk_partner_rel_to FOREIGN KEY (to_partner_id) REFERENCES T_partner(id) ON DELETE CASCADE,
    CONSTRAINT fk_partner_rel_type FOREIGN KEY (relationship_type_id) REFERENCES T_relationship_type(id) ON DELETE SET NULL,
    CONSTRAINT chk_partner_rel_different CHECK (from_partner_id != to_partner_id)
);

-- Create indices for common queries
CREATE INDEX idx_partner_rel_from ON T_partner_relationship(from_partner_id);
CREATE INDEX idx_partner_rel_to ON T_partner_relationship(to_partner_id);
CREATE INDEX idx_partner_rel_type ON T_partner_relationship(relationship_type_id);
CREATE INDEX idx_partner_rel_dates ON T_partner_relationship(effective_from, effective_to);
CREATE INDEX idx_partner_rel_bidirectional ON T_partner_relationship(from_partner_id, to_partner_id);
