import { Address } from './address.model';

export interface AddressDetail {
  id?: string;
  address?: Address;
  isPrimary: boolean;
  addressType?: string;
  validFrom?: string;
  validTo?: string;
}
