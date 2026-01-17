export interface PartnerType {
  id: string;
  typeCode: string;
  description?: string;
}

export interface Partner {
  id: string;
  partnerNumber: string;
  partnerType?: PartnerType;
  createdAt?: string;
  updatedAt?: string;
  active: boolean;
  notes?: string;
}
