import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { signal } from '@angular/core';
import { PartnerAddressComponent } from './partner-address.component';
import { Controller } from '../controller';
import { ModelService } from '../model.service';
import { ToastService } from '../core/toast/toast.service';
import { ConfirmDialogService } from '../core/confirm-dialog/confirm-dialog.service';
import { PartnerService } from '../partner.service';
import { Partner, NaturalPerson } from '../models/partner.model';
import { AddressDetail } from '../models/address-detail.model';
import { Address } from '../models/address.model';
import { PartnerDiscriminator } from '../models/partner-discriminator';

describe('PartnerAddressComponent', () => {
  let component: PartnerAddressComponent;
  let fixture: ComponentFixture<PartnerAddressComponent>;
  let mockController: jasmine.SpyObj<Controller>;
  let mockModelService: jasmine.SpyObj<ModelService>;
  let mockToastService: jasmine.SpyObj<ToastService>;
  let mockConfirmService: jasmine.SpyObj<ConfirmDialogService>;
  let mockPartnerService: jasmine.SpyObj<PartnerService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockLocation: jasmine.SpyObj<Location>;
  let mockActivatedRoute: any;

  const mockPartner: NaturalPerson = {
    id: '123',
    partnerNumber: 'P00000001',
    partnerType: PartnerDiscriminator.NATURAL_PERSON,
    active: true,
    firstName: 'John',
    lastName: 'Doe'
  };

  const mockAddressDetails: AddressDetail[] = [
    {
      id: '1',
      addressType: 'BILLING',
      isPrimary: true,
      address: {
        id: 'addr1',
        streetLine1: '123 Main St',
        city: 'Berlin',
        countryCode: 'DE',
        isVerified: true
      }
    },
    {
      id: '2',
      addressType: 'SHIPPING',
      isPrimary: false,
      address: {
        id: 'addr2',
        streetLine1: '456 Oak Ave',
        city: 'Munich',
        countryCode: 'DE',
        isVerified: false
      }
    }
  ];

  const mockAddresses: Address[] = [
    {
      id: 'addr1',
      streetLine1: '123 Main St',
      city: 'Berlin',
      countryCode: 'DE',
      isVerified: true
    },
    {
      id: 'addr2',
      streetLine1: '456 Oak Ave',
      city: 'Munich',
      countryCode: 'DE',
      isVerified: false
    }
  ];

  beforeEach(async () => {
    mockController = jasmine.createSpyObj('Controller', [
      'getPartnerById',
      'loadPartnerAddresses',
      'loadAddresses',
      'addAddressToPartner',
      'removeAddressFromPartner'
    ]);
    
    mockModelService = jasmine.createSpyObj('ModelService', ['getCountryName'], {
      partners$: signal([mockPartner]),
      addresses$: signal(mockAddresses)
    });

    mockToastService = jasmine.createSpyObj('ToastService', ['success', 'error']);
    mockConfirmService = jasmine.createSpyObj('ConfirmDialogService', ['confirm']);
    mockPartnerService = jasmine.createSpyObj('PartnerService', ['getPartnerName']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockLocation = jasmine.createSpyObj('Location', ['back']);

    mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: jasmine.createSpy('get').and.returnValue('123')
        }
      }
    };

    mockController.getPartnerById.and.resolveTo(mockPartner);
    mockController.loadPartnerAddresses.and.resolveTo(mockAddressDetails);
    mockController.loadAddresses.and.resolveTo();
    mockController.addAddressToPartner.and.resolveTo();
    mockController.removeAddressFromPartner.and.resolveTo();
    mockPartnerService.getPartnerName.and.returnValue('John Doe');
    mockModelService.getCountryName.and.returnValue('Germany');

    await TestBed.configureTestingModule({
      imports: [PartnerAddressComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: Controller, useValue: mockController },
        { provide: ModelService, useValue: mockModelService },
        { provide: ToastService, useValue: mockToastService },
        { provide: ConfirmDialogService, useValue: mockConfirmService },
        { provide: PartnerService, useValue: mockPartnerService },
        { provide: Router, useValue: mockRouter },
        { provide: Location, useValue: mockLocation },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PartnerAddressComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load partner data and addresses on init', async () => {
    component.ngOnInit();
    await fixture.whenStable();

    expect(component.partnerId).toBe('123');
    expect(mockController.getPartnerById).toHaveBeenCalledWith('123');
    expect(mockController.loadPartnerAddresses).toHaveBeenCalledWith('123');
  });

  it('should set partner from loaded data', async () => {
    component.partnerId = '123';
    await component.loadPartnerData();

    expect(mockController.getPartnerById).toHaveBeenCalledWith('123');
    expect(component.partner).toEqual(mockPartner);
  });

  it('should show error when partner not found', async () => {
    component.partnerId = '999';
    mockController.getPartnerById.and.resolveTo(null);

    await component.loadPartnerData();

    expect(mockController.getPartnerById).toHaveBeenCalledWith('999');
    expect(component.error).toBe('Partner not found');
    expect(mockToastService.error).toHaveBeenCalledWith('Partner not found');
  });

  it('should load partner addresses', async () => {
    await component.loadPartnerAddresses();

    expect(component.partnerAddresses).toEqual(mockAddressDetails);
    expect(component.loading).toBeFalse();
  });

  it('should handle error loading partner addresses', async () => {
    mockController.loadPartnerAddresses.and.rejectWith(new Error('Network error'));

    await component.loadPartnerAddresses();

    expect(component.error).toBe('Failed to load partner addresses');
    expect(mockToastService.error).toHaveBeenCalledWith('Failed to load partner addresses');
    expect(component.loading).toBeFalse();
  });

  describe('address autocomplete', () => {
    it('should fetch addresses for autocomplete', async () => {
      const result = await component.fetchAddresses('Berlin');

      expect(mockController.loadAddresses).toHaveBeenCalledWith('Berlin');
      expect(result.length).toBe(2);
      expect(result[0].value).toBe('addr1');
    });

    it('should format address labels correctly', () => {
      const label = component.formatAddressLabel(mockAddresses[0]);

      expect(label).toBe('123 Main St, Berlin, Germany');
      expect(mockModelService.getCountryName).toHaveBeenCalledWith('DE');
    });

    it('should handle address selection', () => {
      component.onAddressSelected({ value: 'addr1', label: 'Test Address' });

      expect(component.selectedAddressId).toBe('addr1');
    });
  });

  describe('form management', () => {
    it('should toggle add form and reset', () => {
      component.showAddForm = false;
      component.toggleAddForm();

      expect(component.showAddForm).toBeTrue();
      expect(component.selectedAddressId).toBe('');
      expect(component.newAddressDetail.addressType).toBe('BILLING');
    });

    it('should hide form when toggling off', () => {
      component.showAddForm = true;
      component.toggleAddForm();

      expect(component.showAddForm).toBeFalse();
    });

    it('should reset form to defaults', () => {
      component.selectedAddressId = 'addr1';
      component.newAddressDetail.addressType = 'SHIPPING';
      component.newAddressDetail.isPrimary = true;

      component.resetForm();

      expect(component.selectedAddressId).toBe('');
      expect(component.newAddressDetail.addressType).toBe('BILLING');
      expect(component.newAddressDetail.isPrimary).toBeFalse();
    });
  });

  describe('adding address to partner', () => {
    it('should add address successfully', async () => {
      component.partnerId = '123'; // Set partnerId
      component.selectedAddressId = 'addr1';
      component.newAddressDetail = {
        addressType: 'BILLING',
        isPrimary: true
      };
      component.showAddForm = true;

      await component.onSubmitAdd();

      expect(mockController.addAddressToPartner).toHaveBeenCalledWith(
        '123',
        'addr1',
        jasmine.objectContaining({
          addressType: 'BILLING',
          isPrimary: true
        })
      );
      expect(mockToastService.success).toHaveBeenCalledWith('Address added to partner');
      expect(component.showAddForm).toBeFalse();
      expect(mockController.loadPartnerAddresses).toHaveBeenCalledWith('123');
    });

    it('should show error when no address selected', async () => {
      component.partnerId = '123';
      component.selectedAddressId = '';

      await component.onSubmitAdd();

      expect(mockToastService.error).toHaveBeenCalledWith('Please select an address');
      expect(mockController.addAddressToPartner).not.toHaveBeenCalled();
    });

    it('should handle error adding address', async () => {
      component.partnerId = '123';
      component.selectedAddressId = 'addr1';
      mockController.addAddressToPartner.and.rejectWith(new Error('Network error'));

      await component.onSubmitAdd();

      expect(mockToastService.error).toHaveBeenCalledWith('Failed to add address to partner');
    });
  });

  describe('removing address from partner', () => {
    it('should remove address when confirmed', async () => {
      component.partnerId = '123'; // Set partnerId
      mockConfirmService.confirm.and.resolveTo(true);

      await component.onDelete(mockAddressDetails[0]);

      expect(mockConfirmService.confirm).toHaveBeenCalledWith({
        title: 'Remove Address',
        message: 'Are you sure you want to remove this address from the partner?'
      });
      expect(mockController.removeAddressFromPartner).toHaveBeenCalledWith('123', '1');
      expect(mockToastService.success).toHaveBeenCalledWith('Address removed from partner');
      expect(mockController.loadPartnerAddresses).toHaveBeenCalledWith('123');
    });

    it('should not remove address when cancelled', async () => {
      component.partnerId = '123';
      mockConfirmService.confirm.and.resolveTo(false);

      await component.onDelete(mockAddressDetails[0]);

      expect(mockController.removeAddressFromPartner).not.toHaveBeenCalled();
    });

    it('should handle error removing address', async () => {
      component.partnerId = '123';
      mockConfirmService.confirm.and.resolveTo(true);
      mockController.removeAddressFromPartner.and.rejectWith(new Error('Network error'));

      await component.onDelete(mockAddressDetails[0]);

      expect(mockToastService.error).toHaveBeenCalledWith('Failed to remove address from partner');
    });
  });

  describe('navigation', () => {
    it('should navigate to address management', () => {
      component.goToAddressManagement();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/addresses']);
    });

    it('should go back', () => {
      component.goBack();

      expect(mockLocation.back).toHaveBeenCalled();
    });
  });

  describe('display methods', () => {
    it('should get partner name', () => {
      component.partner = mockPartner;

      const name = component.getPartnerName();

      expect(name).toBe('John Doe');
      expect(mockPartnerService.getPartnerName).toHaveBeenCalledWith(mockPartner);
    });

    it('should return Loading when partner is null', () => {
      component.partner = null;

      const name = component.getPartnerName();

      expect(name).toBe('Loading...');
    });

    it('should get address display', () => {
      const display = component.getAddressDisplay(mockAddressDetails[0]);

      expect(display).toBe('123 Main St, Berlin, Germany');
    });

    it('should handle unknown address', () => {
      const addressDetail: AddressDetail = {
        id: '3',
        addressType: 'BILLING',
        isPrimary: false
      };

      const display = component.getAddressDisplay(addressDetail);

      expect(display).toBe('Unknown address');
    });

    it('should get partner number and name', () => {
      component.partner = mockPartner;

      const result = component.getPartnerNumberAndName();

      expect(result).toBe('P00000001 John Doe');
    });

    it('should return empty string when partner is null', () => {
      component.partner = null;

      const result = component.getPartnerNumberAndName();

      expect(result).toBe('');
    });
  });
});
