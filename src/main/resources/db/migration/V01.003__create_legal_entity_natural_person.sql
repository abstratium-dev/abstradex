-- Create junction table for legal entity to natural person relationship (employment/representation)
-- Now references T_partner directly since using SINGLE_TABLE inheritance
CREATE TABLE T_legal_entity_natural_person (
    legal_entity_id VARCHAR(36) NOT NULL,
    natural_person_id VARCHAR(36) NOT NULL,
    PRIMARY KEY (legal_entity_id, natural_person_id),
    CONSTRAINT fk_lenp_legal_entity FOREIGN KEY (legal_entity_id) REFERENCES T_partner(id) ON DELETE CASCADE,
    CONSTRAINT fk_lenp_natural_person FOREIGN KEY (natural_person_id) REFERENCES T_partner(id) ON DELETE CASCADE
);

-- Create indices for bidirectional lookups
CREATE INDEX idx_lenp_natural_person ON T_legal_entity_natural_person(natural_person_id);
CREATE INDEX idx_lenp_legal_entity ON T_legal_entity_natural_person(legal_entity_id);
