-- Insert default partner types
INSERT INTO T_partner_type (id, type_code, description) VALUES
    (UUID(), 'NATURAL_PERSON', 'Individual person or natural person'),
    (UUID(), 'LEGAL_ENTITY', 'Company, organization, or legal entity');
