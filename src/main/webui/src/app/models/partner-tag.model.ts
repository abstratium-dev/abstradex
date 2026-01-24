import { Tag } from './partner.model';

export interface PartnerTag {
  id?: string;
  tag?: Tag;
  taggedAt?: string;
  taggedBy?: string;
}
