import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { PartnerOverviewComponent } from './partner-overview.component';
import { Controller } from '../controller';
import { ModelService } from '../model.service';
import { PartnerService } from '../partner.service';
import { Partner, NaturalPerson, LegalEntity } from '../models';
import { PartnerDiscriminator } from '../models/partner-discriminator';

describe('PartnerOverviewComponent', () => {
  let component: PartnerOverviewComponent;
  let fixture: ComponentFixture<PartnerOverviewComponent>;
  let mockController: jasmine.SpyObj<Controller>;
  let mockModelService: jasmine.SpyObj<ModelService>;
  let mockPartnerService: jasmine.SpyObj<PartnerService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: any;
  let httpMock: HttpTestingController;

  const mockPartner: NaturalPerson = {
    id: '123',
    partnerNumber: 'P00000001',
    partnerType: PartnerDiscriminator.NATURAL_PERSON,
    active: true,
    firstName: 'John',
    lastName: 'Doe'
  };

  beforeEach(async () => {
    mockController = jasmine.createSpyObj('Controller', [
      'loadPartners',
      'getPartnerById',
      'loadPartnerAddresses',
      'loadPartnerContacts'
    ]);
    mockModelService = jasmine.createSpyObj('ModelService', ['partners$', 'lastPartnerSearchTerm$']);
    mockPartnerService = jasmine.createSpyObj('PartnerService', ['getPartnerIcon', 'getPartnerName']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: jasmine.createSpy('get').and.returnValue('123')
        }
      }
    };

    // Setup default return values
    mockController.loadPartners.and.resolveTo(undefined);
    mockController.getPartnerById.and.resolveTo(mockPartner);
    mockController.loadPartnerAddresses.and.resolveTo([]);
    mockController.loadPartnerContacts.and.resolveTo([]);
    (mockModelService.partners$ as any) = jasmine.createSpy('partners$').and.returnValue([mockPartner]);
    (mockModelService.lastPartnerSearchTerm$ as any) = jasmine.createSpy('lastPartnerSearchTerm$').and.returnValue('test search');
    mockPartnerService.getPartnerIcon.and.returnValue('👤');
    mockPartnerService.getPartnerName.and.returnValue('John Doe');

    await TestBed.configureTestingModule({
      imports: [PartnerOverviewComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Controller, useValue: mockController },
        { provide: ModelService, useValue: mockModelService },
        { provide: PartnerService, useValue: mockPartnerService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PartnerOverviewComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  // No longer using HTTP mocks

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load partner on init', fakeAsync(() => {
    component.ngOnInit();
    tick();
    
    expect(mockController.getPartnerById).toHaveBeenCalledWith('123');
    expect(mockController.loadPartnerAddresses).toHaveBeenCalledWith('123');
    expect(mockController.loadPartnerContacts).toHaveBeenCalledWith('123');
    expect(component.partner).toEqual(mockPartner);
    expect(component.loading).toBeFalse();
    expect(component.error).toBeNull();
  }));

  it('should show error when partner not found', fakeAsync(() => {
    mockController.getPartnerById.and.rejectWith(new Error('Not found'));
    
    component.ngOnInit();
    tick();
    
    expect(component.partner).toBeNull();
    expect(component.error).toBe('Failed to load partner details');
  }));

  it('should not overwrite search term when loading partner', fakeAsync(() => {
    // This test ensures that loading a partner by ID doesn't overwrite the search term
    component.ngOnInit();
    tick();
    
    // Verify that loadPartners was NOT called (which would overwrite the search term)
    expect(mockController.loadPartners).not.toHaveBeenCalled();
    
    // Verify controller methods were called
    expect(mockController.getPartnerById).toHaveBeenCalledWith('123');
    expect(mockController.loadPartnerAddresses).toHaveBeenCalledWith('123');
    expect(mockController.loadPartnerContacts).toHaveBeenCalledWith('123');
    
    // Verify partner was loaded successfully
    expect(component.partner).toEqual(mockPartner);
    expect(component.error).toBeNull();
  }));

  it('should navigate back to partners list', () => {
    component.goBack();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/partners']);
  });

  it('should navigate to manage addresses', () => {
    component.partner = mockPartner;
    component.manageAddresses();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/partners', '123', 'addresses']);
  });

  it('should navigate to manage contacts', () => {
    component.partner = mockPartner;
    component.manageContacts();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/partners', '123', 'contacts']);
  });

  it('should navigate to manage tags', () => {
    component.partner = mockPartner;
    component.manageTags();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/partners', '123', 'tags']);
  });

  it('should detect natural person', () => {
    component.partner = mockPartner;
    expect(component.isNaturalPerson()).toBeTrue();
    expect(component.isLegalEntity()).toBeFalse();
  });

  it('should detect legal entity', () => {
    const legalEntity: LegalEntity = {
      id: '456',
      partnerNumber: 'P00000002',
      partnerType: PartnerDiscriminator.LEGAL_ENTITY,
      active: true,
      legalName: 'Acme Corp'
    };
    component.partner = legalEntity;
    expect(component.isLegalEntity()).toBeTrue();
    expect(component.isNaturalPerson()).toBeFalse();
  });

  describe('Contact link functionality', () => {
    it('should generate mailto link for email contacts', () => {
      const emailContact = {
        id: '1',
        contactType: 'EMAIL',
        contactValue: 'test@example.com',
        isPrimary: false,
        isVerified: false
      };
      expect(component.getContactHref(emailContact)).toBe('mailto:test@example.com');
      expect(component.isContactClickable(emailContact)).toBeTrue();
    });

    it('should generate tel link for phone contacts', () => {
      const phoneContact = {
        id: '2',
        contactType: 'PHONE',
        contactValue: '+1-555-0123',
        isPrimary: false,
        isVerified: false
      };
      expect(component.getContactHref(phoneContact)).toBe('tel:+1-555-0123');
      expect(component.isContactClickable(phoneContact)).toBeTrue();
    });

    it('should generate tel link for mobile contacts', () => {
      const mobileContact = {
        id: '3',
        contactType: 'MOBILE',
        contactValue: '+1-555-0456',
        isPrimary: false,
        isVerified: false
      };
      expect(component.getContactHref(mobileContact)).toBe('tel:+1-555-0456');
      expect(component.isContactClickable(mobileContact)).toBeTrue();
    });

    it('should generate tel link for fax contacts', () => {
      const faxContact = {
        id: '4',
        contactType: 'FAX',
        contactValue: '+1-555-0789',
        isPrimary: false,
        isVerified: false
      };
      expect(component.getContactHref(faxContact)).toBe('tel:+1-555-0789');
      expect(component.isContactClickable(faxContact)).toBeTrue();
    });

    it('should return direct URL for website contacts', () => {
      const websiteContact = {
        id: '5',
        contactType: 'WEBSITE',
        contactValue: 'https://example.com',
        isPrimary: false,
        isVerified: false
      };
      expect(component.getContactHref(websiteContact)).toBe('https://example.com');
      expect(component.isContactClickable(websiteContact)).toBeTrue();
    });

    it('should return direct URL for LinkedIn contacts', () => {
      const linkedinContact = {
        id: '6',
        contactType: 'LINKEDIN',
        contactValue: 'https://linkedin.com/in/johndoe',
        isPrimary: false,
        isVerified: false
      };
      expect(component.getContactHref(linkedinContact)).toBe('https://linkedin.com/in/johndoe');
      expect(component.isContactClickable(linkedinContact)).toBeTrue();
    });

    it('should return empty string for other contact types', () => {
      const otherContact = {
        id: '7',
        contactType: 'OTHER',
        contactValue: 'Some value',
        isPrimary: false,
        isVerified: false
      };
      expect(component.getContactHref(otherContact)).toBe('');
      expect(component.isContactClickable(otherContact)).toBeFalse();
    });

    it('should handle case-insensitive contact types', () => {
      const emailContact = {
        id: '8',
        contactType: 'email',
        contactValue: 'test@example.com',
        isPrimary: false,
        isVerified: false
      };
      expect(component.getContactHref(emailContact)).toBe('mailto:test@example.com');
      expect(component.isContactClickable(emailContact)).toBeTrue();
    });
  });
});
