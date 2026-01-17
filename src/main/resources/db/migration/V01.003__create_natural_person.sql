-- Create natural person table (extends partner)
CREATE TABLE T_natural_person (
    partner_id VARCHAR(36) PRIMARY KEY,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    middle_name VARCHAR(100),
    title VARCHAR(20),
    date_of_birth DATE,
    tax_id VARCHAR(50),
    preferred_language VARCHAR(10),
    CONSTRAINT fk_natural_person_partner FOREIGN KEY (partner_id) REFERENCES T_partner(id) ON DELETE CASCADE
);

-- Create indices for common queries
CREATE INDEX idx_natural_person_last_name ON T_natural_person(last_name);
CREATE INDEX idx_natural_person_first_name ON T_natural_person(first_name);
CREATE INDEX idx_natural_person_tax_id ON T_natural_person(tax_id);
CREATE INDEX idx_natural_person_name_search ON T_natural_person(last_name, first_name);
