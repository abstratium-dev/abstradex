export interface PartnerType {
  id: string;
  typeCode: string;
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
