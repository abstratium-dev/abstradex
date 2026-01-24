export interface PartnerType {
  id: string;
  typeCode: string;
  description?: string;
}

export interface Tag {
  id?: string;
  tagName: string;
  colorHex?: string;
  description?: string;
}

export interface Partner {
  id: string;
  partnerNumber: string;
  partnerNumberSeq?: number;
  partnerType?: PartnerType;
  createdAt?: string;
  updatedAt?: string;
  active: boolean;
  notes?: string;
  addressLine?: string;  // Formatted address line from backend
  email?: string;        // Primary/verified email from backend
  phone?: string;        // Primary/verified phone (mobile or phone) from backend
  website?: string;      // Primary/verified website from backend
  tags?: Tag[];          // Tags assigned to this partner
}

export interface NaturalPerson extends Partner {
  firstName?: string;
  lastName?: string;
  middleName?: string;
  title?: string;
  dateOfBirth?: string;
  taxId?: string;
  preferredLanguage?: string;
}

export interface LegalEntity extends Partner {
  legalName?: string;
  tradingName?: string;
  registrationNumber?: string;
  taxId?: string;
  legalForm?: string;
  incorporationDate?: string;
  jurisdiction?: string;
}
