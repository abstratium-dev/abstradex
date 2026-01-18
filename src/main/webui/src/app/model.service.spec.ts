import { TestBed } from '@angular/core/testing';
import { ModelService, Partner, Address, Country } from './model.service';

describe('ModelService', () => {
  let service: ModelService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ModelService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Initial State', () => {
    it('should have null config initially', () => {
      expect(service.config$()).toBeNull();
    });

    it('should have empty partners initially', () => {
      expect(service.partners$()).toEqual([]);
    });

    it('should have empty addresses initially', () => {
      expect(service.addresses$()).toEqual([]);
    });

    it('should have empty countries initially', () => {
      expect(service.countries$()).toEqual([]);
    });

    it('should not be loading partners initially', () => {
      expect(service.partnersLoading$()).toBe(false);
    });

    it('should have no partner error initially', () => {
      expect(service.partnersError$()).toBeNull();
    });
  });

  describe('Config Management', () => {
    it('should set config', () => {
      const config = { logLevel: 'INFO', defaultCountry: 'CH' };
      service.setConfig(config);
      expect(service.config$()).toEqual(config);
    });

    it('should update config', () => {
      const config1 = { logLevel: 'DEBUG' };
      const config2 = { logLevel: 'INFO', defaultCountry: 'DE' };
      
      service.setConfig(config1);
      expect(service.config$()).toEqual(config1);
      
      service.setConfig(config2);
      expect(service.config$()).toEqual(config2);
    });
  });

  describe('Partner Management', () => {
    it('should set partners', () => {
      const partners: Partner[] = [
        { id: '1', partnerNumber: 'P001', active: true },
        { id: '2', partnerNumber: 'P002', active: false }
      ];
      service.setPartners(partners);
      expect(service.partners$()).toEqual(partners);
    });

    it('should update partners', () => {
      const partners1: Partner[] = [{ id: '1', partnerNumber: 'P001', active: true }];
      const partners2: Partner[] = [{ id: '2', partnerNumber: 'P002', active: true }];
      
      service.setPartners(partners1);
      expect(service.partners$()).toEqual(partners1);
      
      service.setPartners(partners2);
      expect(service.partners$()).toEqual(partners2);
    });

    it('should set partners loading state', () => {
      service.setPartnersLoading(true);
      expect(service.partnersLoading$()).toBe(true);
      
      service.setPartnersLoading(false);
      expect(service.partnersLoading$()).toBe(false);
    });

    it('should set partners error', () => {
      service.setPartnersError('Failed to load partners');
      expect(service.partnersError$()).toBe('Failed to load partners');
      
      service.setPartnersError(null);
      expect(service.partnersError$()).toBeNull();
    });
  });

  describe('Address Management', () => {
    it('should set addresses', () => {
      const addresses: Address[] = [
        { id: '1', streetLine1: '123 Main St', city: 'Berlin', countryCode: 'DE', isVerified: true },
        { id: '2', streetLine1: '456 Oak Ave', city: 'Zurich', countryCode: 'CH', isVerified: false }
      ];
      service.setAddresses(addresses);
      expect(service.addresses$()).toEqual(addresses);
    });

    it('should set addresses loading state', () => {
      service.setAddressesLoading(true);
      expect(service.addressesLoading$()).toBe(true);
    });

    it('should set addresses error', () => {
      service.setAddressesError('Failed to load addresses');
      expect(service.addressesError$()).toBe('Failed to load addresses');
    });
  });

  describe('Countries Management', () => {
    it('should set countries', () => {
      const countries: Country[] = [
        { code: 'CH', name: 'Switzerland' },
        { code: 'DE', name: 'Germany' }
      ];
      service.setCountries(countries);
      expect(service.countries$()).toEqual(countries);
    });
  });

  describe('Service Singleton', () => {
    it('should be a singleton across injections', () => {
      const service2 = TestBed.inject(ModelService);
      const partners: Partner[] = [{ id: '1', partnerNumber: 'P001', active: true }];
      service.setPartners(partners);
      expect(service2.partners$()).toEqual(partners);
    });
  });
});
