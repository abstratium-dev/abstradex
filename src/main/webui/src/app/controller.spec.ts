import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { Controller } from './controller';
import { ModelService, Partner, Address } from './model.service';

describe('Controller', () => {
  let controller: Controller;
  let modelService: ModelService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    controller = TestBed.inject(Controller);
    modelService = TestBed.inject(ModelService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(controller).toBeTruthy();
  });

  describe('loadConfig', () => {
    it('should load config and update model service', async () => {
      const mockConfig = { logLevel: 'INFO', defaultCountry: 'CH' };

      const promise = controller.loadConfig();

      const req = httpMock.expectOne('/public/config');
      expect(req.request.method).toBe('GET');
      req.flush(mockConfig);

      const result = await promise;
      expect(result.logLevel).toBe('INFO');
      expect(modelService.config$()).toEqual(mockConfig);
    });
  });

  describe('loadPartners', () => {
    it('should load partners and update model service', () => {
      const mockPartners: Partner[] = [
        { id: '1', partnerNumber: 'P001', active: true },
        { id: '2', partnerNumber: 'P002', active: true }
      ];

      controller.loadPartners();

      const req = httpMock.expectOne('/api/partner');
      expect(req.request.method).toBe('GET');
      req.flush(mockPartners);

      expect(modelService.partners$()).toEqual(mockPartners);
      expect(modelService.partnersLoading$()).toBe(false);
    });

    it('should handle error response', () => {
      controller.loadPartners();

      const req = httpMock.expectOne('/api/partner');
      req.error(new ProgressEvent('error'), { status: 500, statusText: 'Server Error' });

      expect(modelService.partners$()).toEqual([]);
      expect(modelService.partnersLoading$()).toBe(false);
      expect(modelService.partnersError$()).toBe('Failed to load partners');
    });
  });

  describe('loadAddresses', () => {
    it('should load addresses and update model service', () => {
      const mockAddresses: Address[] = [
        { id: '1', streetLine1: '123 Main St', city: 'Berlin', countryCode: 'DE', isVerified: true },
        { id: '2', streetLine1: '456 Oak Ave', city: 'Zurich', countryCode: 'CH', isVerified: false }
      ];

      controller.loadAddresses();

      const req = httpMock.expectOne('/api/address');
      expect(req.request.method).toBe('GET');
      req.flush(mockAddresses);

      expect(modelService.addresses$()).toEqual(mockAddresses);
      expect(modelService.addressesLoading$()).toBe(false);
    });
  });

  describe('createPartner', () => {
    it('should create partner and reload list', async () => {
      const newPartner: Partner = { id: '123', partnerNumber: 'P003', active: true };

      const createPromise = controller.createPartner(newPartner);

      const createReq = httpMock.expectOne('/api/partner');
      expect(createReq.request.method).toBe('POST');
      createReq.flush(newPartner);

      const result = await createPromise;
      expect(result).toEqual(newPartner);

      // Verify reload was triggered
      const loadReq = httpMock.expectOne('/api/partner');
      expect(loadReq.request.method).toBe('GET');
      loadReq.flush([newPartner]);
    });
  });
});
