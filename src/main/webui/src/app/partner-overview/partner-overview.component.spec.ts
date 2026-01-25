import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { PartnerOverviewComponent } from './partner-overview.component';
import { Controller } from '../controller';
import { ModelService } from '../model.service';
import { PartnerService } from '../partner.service';
import { Partner, NaturalPerson, LegalEntity } from '../models';

describe('PartnerOverviewComponent', () => {
  let component: PartnerOverviewComponent;
  let fixture: ComponentFixture<PartnerOverviewComponent>;
  let mockController: jasmine.SpyObj<Controller>;
  let mockModelService: jasmine.SpyObj<ModelService>;
  let mockPartnerService: jasmine.SpyObj<PartnerService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: any;

  const mockPartner: NaturalPerson = {
    id: '123',
    partnerNumber: 'P00000001',
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
        { provide: Controller, useValue: mockController },
        { provide: ModelService, useValue: mockModelService },
        { provide: PartnerService, useValue: mockPartnerService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PartnerOverviewComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load partner on init', async () => {
    component.ngOnInit();
    await fixture.whenStable();
    
    expect(mockController.loadPartners).toHaveBeenCalled();
    expect(component.partner).toEqual(mockPartner);
    expect(component.loading).toBeFalse();
    expect(component.error).toBeNull();
  });

  it('should show error when partner not found', async () => {
    (mockModelService.partners$ as any) = jasmine.createSpy('partners$').and.returnValue([]);
    
    component.ngOnInit();
    await fixture.whenStable();
    
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
      active: true,
      legalName: 'Acme Corp'
    };
    component.partner = legalEntity;
    expect(component.isLegalEntity()).toBeTrue();
    expect(component.isNaturalPerson()).toBeFalse();
  });
});
