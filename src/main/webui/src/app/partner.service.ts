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

    // Check if it's a NaturalPerson by checking for any NaturalPerson-specific fields
    if ('firstName' in partner || 'lastName' in partner || 'middleName' in partner || 
        'title' in partner || 'dateOfBirth' in partner) {
      const parts = [np.title, np.firstName, np.middleName, np.lastName].filter(p => p);
      return parts.join(' ') || 'Unnamed Person';
    } 
    // Check if it's a LegalEntity by checking for any LegalEntity-specific fields
    else if ('legalName' in partner || 'tradingName' in partner || 
             'registrationNumber' in partner || 'jurisdiction' in partner || 'legalForm' in partner) {
      return le.tradingName || le.legalName || 'Unnamed Entity';
    }
    return 'Unknown type of partner';
  }

  getPartnerIcon(partner: Partner): string {
    // Check if it's a NaturalPerson by checking for any NaturalPerson-specific fields
    if ('firstName' in partner || 'lastName' in partner || 'middleName' in partner || 
        'title' in partner || 'dateOfBirth' in partner) {
      return '👤';
    } 
    // Check if it's a LegalEntity by checking for any LegalEntity-specific fields
    else if ('legalName' in partner || 'tradingName' in partner || 
             'registrationNumber' in partner || 'jurisdiction' in partner || 'legalForm' in partner) {
      return '🏢';
    }
    return '❓';
  }

}
