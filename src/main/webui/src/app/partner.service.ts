import { Injectable } from '@angular/core';
import { LegalEntity, NaturalPerson, Partner } from './models';

@Injectable({
  providedIn: 'root',
})
export class PartnerService {

  getPartnerName(partner: Partner | null): string {
    if(partner == null) return ""
    const np = partner as NaturalPerson;
    const le = partner as LegalEntity;

    if (np.firstName || np.lastName) {
      const parts = [np.title, np.firstName, np.middleName, np.lastName].filter(p => p);
      return parts.join(' ') || 'Unnamed Person';
    } else if (le.legalName) {
      return le.tradingName || le.legalName || 'Unnamed Entity';
    }
    return 'Unknown type of partner';
  }

  getPartnerIcon(partner: Partner): string {
    const np = partner as NaturalPerson;
    const le = partner as LegalEntity;

    if (np.firstName || np.lastName) {
      return '👤';
    } else if (le.legalName) {
      return '🏢';
    }
    return '❓';
  }

}
