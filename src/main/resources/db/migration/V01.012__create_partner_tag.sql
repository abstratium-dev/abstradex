-- Create partner tag table (junction table for tagging partners)
CREATE TABLE T_partner_tag (
    id VARCHAR(36) PRIMARY KEY,
    partner_id VARCHAR(36) NOT NULL,
    tag_id VARCHAR(36) NOT NULL,
    tagged_at TIMESTAMP,
    tagged_by VARCHAR(100),
    CONSTRAINT fk_partner_tag_partner FOREIGN KEY (partner_id) REFERENCES T_partner(id) ON DELETE CASCADE,
    CONSTRAINT fk_partner_tag_tag FOREIGN KEY (tag_id) REFERENCES T_tag(id) ON DELETE CASCADE,
    CONSTRAINT uq_partner_tag UNIQUE (partner_id, tag_id)
);

-- Create indices for common queries
CREATE INDEX idx_partner_tag_partner ON T_partner_tag(partner_id);
CREATE INDEX idx_partner_tag_tag ON T_partner_tag(tag_id);
CREATE INDEX idx_partner_tag_tagged_at ON T_partner_tag(tagged_at);
CREATE INDEX idx_partner_tag_tagged_by ON T_partner_tag(tagged_by);
