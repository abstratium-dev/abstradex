-- Create address table
CREATE TABLE T_address (
    id VARCHAR(36) PRIMARY KEY,
    street_line1 VARCHAR(255),
    street_line2 VARCHAR(255),
    city VARCHAR(100),
    state_province VARCHAR(100),
    postal_code VARCHAR(20),
    country_code VARCHAR(2),
    valid_from TIMESTAMP,
    valid_to TIMESTAMP,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE
);

-- Create indices for common queries
CREATE INDEX idx_address_city ON T_address(city);
CREATE INDEX idx_address_postal_code ON T_address(postal_code);
CREATE INDEX idx_address_country_code ON T_address(country_code);
CREATE INDEX idx_address_verified ON T_address(is_verified);
CREATE INDEX idx_address_validity ON T_address(valid_from, valid_to);
