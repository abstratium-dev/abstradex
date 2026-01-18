export interface Address {
  id?: string;
  streetLine1?: string;
  streetLine2?: string;
  city?: string;
  stateProvince?: string;
  postalCode?: string;
  countryCode?: string;
  validFrom?: string;
  validTo?: string;
  isVerified?: boolean;
}
