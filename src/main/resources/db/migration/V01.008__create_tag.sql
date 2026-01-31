-- Create tag table
CREATE TABLE T_tag (
    id VARCHAR(36) PRIMARY KEY,
    tag_name VARCHAR(100) NOT NULL UNIQUE,
    color_hex VARCHAR(7),
    description VARCHAR(255)
);

-- Create index on tag_name for faster lookups
CREATE INDEX idx_tag_name ON T_tag(tag_name);
