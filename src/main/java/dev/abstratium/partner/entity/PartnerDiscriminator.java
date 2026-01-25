package dev.abstratium.partner.entity;

/**
 * Constants for partner type discriminator values.
 * Used in JPA @DiscriminatorValue annotations and throughout the application.
 */
public final class PartnerDiscriminator {
    
    public static final String NATURAL_PERSON = "NATURAL_PERSON";
    public static final String LEGAL_ENTITY = "LEGAL_ENTITY";
    
    private PartnerDiscriminator() {
        // Utility class - prevent instantiation
    }
}
