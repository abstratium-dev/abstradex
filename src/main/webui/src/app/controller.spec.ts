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

  describe('Partner Tag Management', () => {
    describe('loadPartnerTags', () => {
      it('should load partner tags successfully', async () => {
        const mockTags = [
          { id: '1', tagName: 'VIP', colorHex: '#FF0000' },
          { id: '2', tagName: 'Premium', colorHex: '#00FF00' }
        ];

        const promise = controller.loadPartnerTags('partner123');

        const req = httpMock.expectOne('/api/partner/partner123/tag');
        expect(req.request.method).toBe('GET');
        req.flush(mockTags);

        const result = await promise;
        expect(result).toEqual(mockTags);
      });

      it('should throw error when partnerId is empty', async () => {
        await expectAsync(controller.loadPartnerTags('')).toBeRejectedWithError('Partner ID is required to load partner tags');
      });

      it('should throw error when partnerId is whitespace', async () => {
        await expectAsync(controller.loadPartnerTags('   ')).toBeRejectedWithError('Partner ID is required to load partner tags');
      });

      it('should throw error when partnerId is null', async () => {
        await expectAsync(controller.loadPartnerTags(null as any)).toBeRejectedWithError('Partner ID is required to load partner tags');
      });
    });

    describe('addTagToPartner', () => {
      it('should add tag to partner successfully', async () => {
        const mockPartnerTag = { id: 'pt1', partnerId: 'partner123', tagId: 'tag456' };

        const promise = controller.addTagToPartner('partner123', 'tag456');

        const req = httpMock.expectOne('/api/partner/partner123/tag/tag456');
        expect(req.request.method).toBe('POST');
        req.flush(mockPartnerTag);

        const result = await promise;
        expect(result).toEqual(mockPartnerTag);
      });

      it('should throw error when partnerId is empty', async () => {
        await expectAsync(controller.addTagToPartner('', 'tag123')).toBeRejectedWithError('Partner ID is required to add tag to partner');
      });

      it('should throw error when tagId is empty', async () => {
        await expectAsync(controller.addTagToPartner('partner123', '')).toBeRejectedWithError('Tag ID is required to add tag to partner');
      });

      it('should throw error when both IDs are empty', async () => {
        await expectAsync(controller.addTagToPartner('', '')).toBeRejectedWithError('Partner ID is required to add tag to partner');
      });
    });

    describe('removeTagFromPartner', () => {
      it('should remove tag from partner successfully', async () => {
        const promise = controller.removeTagFromPartner('partner123', 'tag456');

        const req = httpMock.expectOne('/api/partner/partner123/tag/tag456');
        expect(req.request.method).toBe('DELETE');
        req.flush(null);

        await promise;
        // Should complete without error
      });

      it('should throw error when partnerId is empty', async () => {
        await expectAsync(controller.removeTagFromPartner('', 'tag123')).toBeRejectedWithError('Partner ID is required to remove tag from partner');
      });

      it('should throw error when tagId is empty', async () => {
        await expectAsync(controller.removeTagFromPartner('partner123', '')).toBeRejectedWithError('Tag ID is required to remove tag from partner');
      });
    });
  });
});
