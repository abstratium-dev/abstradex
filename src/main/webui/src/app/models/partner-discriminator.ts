/**
 * Constants for partner type discriminator values.
 * Must match the values in Java PartnerDiscriminator class.
 */
export const PartnerDiscriminator = {
  NATURAL_PERSON: 'NATURAL_PERSON',
  LEGAL_ENTITY: 'LEGAL_ENTITY'
} as const;

export type PartnerDiscriminatorType = typeof PartnerDiscriminator[keyof typeof PartnerDiscriminator];
