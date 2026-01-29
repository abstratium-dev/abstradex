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
    mockController = jasmine.createSpyObj('Controller', ['loadPartners']);
    mockModelService = jasmine.createSpyObj('ModelService', ['partners$']);
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
    (mockModelService.partners$ as any) = jasmine.createSpy('partners$').and.returnValue([mockPartner]);
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

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load partner on init', fakeAsync(() => {
    component.ngOnInit();
    tick();
    
    // Mock the HTTP requests for addresses and contacts
    const addressReq = httpMock.expectOne('/api/partner/123/address');
    addressReq.flush([]);
    tick();
    
    const contactReq = httpMock.expectOne('/api/partner/123/contact');
    contactReq.flush([]);
    tick();
    
    expect(mockController.loadPartners).toHaveBeenCalled();
    expect(component.partner).toEqual(mockPartner);
    expect(component.loading).toBeFalse();
    expect(component.error).toBeNull();
  }));

  it('should show error when partner not found', async () => {
    (mockModelService.partners$ as any) = jasmine.createSpy('partners$').and.returnValue([]);
    
    component.ngOnInit();
    await fixture.whenStable();
    
    // No HTTP requests should be made when partner is not found
    httpMock.expectNone('/api/partner/123/address');
    httpMock.expectNone('/api/partner/123/contact');
    
    expect(component.partner).toBeNull();
    expect(component.error).toBe('Partner not found');
  });

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
});
