import { Injectable } from '@angular/core';
import { LegalEntity, NaturalPerson, Partner } from './models';
import { PartnerDiscriminator } from './models/partner-discriminator';

@Injectable({
  providedIn: 'root',
})
export class PartnerService {

  getPartnerName(partner: Partner | null): string {
    if(partner == null) return ""
    const np = partner as NaturalPerson;
    const le = partner as LegalEntity;

    // Use partnerType discriminator from backend if available
    if (partner.partnerType === PartnerDiscriminator.NATURAL_PERSON) {
      const parts = [np.title, np.firstName, np.middleName, np.lastName].filter(p => p);
      return parts.join(' ') || 'Unnamed Natural Person';
    } else if (partner.partnerType === PartnerDiscriminator.LEGAL_ENTITY) {
      return le.tradingName || le.legalName || 'Unnamed Legal Entity';
    }
    return 'Unknown type of partner';
  }

  getPartnerIcon(partner: Partner): string {
    // Use the partnerType discriminator field from backend
    if (partner.partnerType === PartnerDiscriminator.NATURAL_PERSON) {
      return '👤';
    } else if (partner.partnerType === PartnerDiscriminator.LEGAL_ENTITY) {
      return '🏢';
    }
    return '❓'; // Unknown type
  }

}
