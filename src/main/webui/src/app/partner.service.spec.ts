import { TestBed } from '@angular/core/testing';
import { PartnerService } from './partner.service';
import { Partner, NaturalPerson, LegalEntity } from './models';

describe('PartnerService', () => {
  let service: PartnerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PartnerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getPartnerName', () => {
    it('should return empty string for null partner', () => {
      expect(service.getPartnerName(null)).toBe('');
    });

    it('should return full name for natural person with all name parts', () => {
      const partner: NaturalPerson = {
        id: '1',
        partnerNumber: 'P001',
        active: true,
        title: 'Dr.',
        firstName: 'John',
        middleName: 'Q',
        lastName: 'Smith'
      };
      expect(service.getPartnerName(partner)).toBe('Dr. John Q Smith');
    });

    it('should return name without title for natural person without title', () => {
      const partner: NaturalPerson = {
        id: '1',
        partnerNumber: 'P001',
        active: true,
        firstName: 'Jane',
        lastName: 'Doe'
      };
      expect(service.getPartnerName(partner)).toBe('Jane Doe');
    });

    it('should return name without middle name for natural person without middle name', () => {
      const partner: NaturalPerson = {
        id: '1',
        partnerNumber: 'P001',
        active: true,
        firstName: 'Alice',
        lastName: 'Johnson'
      };
      expect(service.getPartnerName(partner)).toBe('Alice Johnson');
    });

    it('should return "Unnamed Person" for natural person with no name parts', () => {
      const partner: NaturalPerson = {
        id: '1',
        partnerNumber: 'P001',
        active: true
      };
      expect(service.getPartnerName(partner)).toBe('Unnamed Person');
    });

    it('should return legal name for legal entity', () => {
      const partner: LegalEntity = {
        id: '2',
        partnerNumber: 'P002',
        active: true,
        legalName: 'Acme Corporation'
      };
      expect(service.getPartnerName(partner)).toBe('Acme Corporation');
    });

    it('should return trading name for legal entity with trading name', () => {
      const partner: LegalEntity = {
        id: '2',
        partnerNumber: 'P002',
        active: true,
        legalName: 'Acme Corporation Ltd',
        tradingName: 'Acme Corp'
      };
      expect(service.getPartnerName(partner)).toBe('Acme Corp');
    });

    it('should return "Unnamed Entity" for legal entity with no legal name', () => {
      const partner: LegalEntity = {
        id: '2',
        partnerNumber: 'P002',
        active: true
      };
      expect(service.getPartnerName(partner)).toBe('Unnamed Entity');
    });

    it('should return "Unknown type of partner" for partner with no identifying fields', () => {
      const partner: Partner = {
        id: '3',
        partnerNumber: 'P003',
        active: true
      };
      expect(service.getPartnerName(partner)).toBe('Unknown type of partner');
    });
  });

  describe('getPartnerIcon', () => {
    it('should return person icon for natural person', () => {
      const partner: NaturalPerson = {
        id: '1',
        partnerNumber: 'P001',
        active: true,
        firstName: 'John',
        lastName: 'Smith'
      };
      expect(service.getPartnerIcon(partner)).toBe('👤');
    });

    it('should return person icon for natural person with only first name', () => {
      const partner: NaturalPerson = {
        id: '1',
        partnerNumber: 'P001',
        active: true,
        firstName: 'John'
      };
      expect(service.getPartnerIcon(partner)).toBe('👤');
    });

    it('should return person icon for natural person with only last name', () => {
      const partner: NaturalPerson = {
        id: '1',
        partnerNumber: 'P001',
        active: true,
        lastName: 'Smith'
      };
      expect(service.getPartnerIcon(partner)).toBe('👤');
    });

    it('should return building icon for legal entity', () => {
      const partner: LegalEntity = {
        id: '2',
        partnerNumber: 'P002',
        active: true,
        legalName: 'Acme Corporation'
      };
      expect(service.getPartnerIcon(partner)).toBe('🏢');
    });

    it('should return question mark icon for unknown partner type', () => {
      const partner: Partner = {
        id: '3',
        partnerNumber: 'P003',
        active: true
      };
      expect(service.getPartnerIcon(partner)).toBe('❓');
    });
  });
});
