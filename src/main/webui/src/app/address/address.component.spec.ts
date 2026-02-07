import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { AddressComponent } from './address.component';
import { Controller } from '../controller';
import { ModelService, Address, Country } from '../model.service';
import { ToastService } from '../core/toast/toast.service';
import { ConfirmDialogService } from '../core/confirm-dialog/confirm-dialog.service';
import { signal } from '@angular/core';

describe('AddressComponent', () => {
  let component: AddressComponent;
  let fixture: ComponentFixture<AddressComponent>;
  let mockController: jasmine.SpyObj<Controller>;
  let mockModelService: jasmine.SpyObj<ModelService>;
  let mockToastService: jasmine.SpyObj<ToastService>;
  let mockConfirmService: jasmine.SpyObj<ConfirmDialogService>;

  const mockAddresses: Address[] = [
    {
      id: '1',
      streetLine1: '123 Main St',
      city: 'Berlin',
      postalCode: '10115',
      countryCode: 'DE',
      isVerified: true
    },
    {
      id: '2',
      streetLine1: '456 Oak Ave',
      city: 'Munich',
      postalCode: '80331',
      countryCode: 'DE',
      isVerified: false
    }
  ];

  const mockCountries: Country[] = [
    { code: 'DE', name: 'Germany' },
    { code: 'US', name: 'United States' },
    { code: 'FR', name: 'France' }
  ];

  beforeEach(async () => {
    mockController = jasmine.createSpyObj('Controller', [
      'loadAddresses',
      'loadCountries',
      'createAddress',
      'deleteAddress',
      'clearAddresses'
    ]);
    
    mockModelService = jasmine.createSpyObj('ModelService', ['setAddresses', 'getCountryName', 'setLastAddressSearchTerm'], {
      addresses$: signal(mockAddresses),
      addressesLoading$: signal(false),
      addressesError$: signal(null),
      addressesLoadTime$: signal(null),
      lastAddressSearchTerm$: signal(''),
      countries$: signal(mockCountries),
      config$: signal({ defaultCountry: 'DE', logLevel: 'INFO' })
    });

    mockToastService = jasmine.createSpyObj('ToastService', ['success', 'error']);
    mockConfirmService = jasmine.createSpyObj('ConfirmDialogService', ['confirm']);

    mockController.loadCountries.and.resolveTo();
    mockController.loadAddresses.and.resolveTo();
    mockController.createAddress.and.resolveTo();
    mockController.deleteAddress.and.resolveTo();
    mockController.clearAddresses.and.stub();

    await TestBed.configureTestingModule({
      imports: [AddressComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Controller, useValue: mockController },
        { provide: ModelService, useValue: mockModelService },
        { provide: ToastService, useValue: mockToastService },
        { provide: ConfirmDialogService, useValue: mockConfirmService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AddressComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load countries on init', () => {
    component.ngOnInit();
    expect(mockController.loadCountries).toHaveBeenCalled();
  });

  it('should set default country from config on init', () => {
    component.ngOnInit();
    expect(component.newAddress.countryCode).toBe('DE');
  });

  describe('search functionality', () => {
    it('should search addresses when search term is 3 or more characters', fakeAsync(() => {
      component.searchTerm = 'Berlin';
      component.onSearch();
      tick(300);

      expect(mockController.loadAddresses).toHaveBeenCalledWith('Berlin');
    }));

    it('should not search when search term is less than 3 characters', fakeAsync(() => {
      component.searchTerm = 'Be';
      component.onSearch();
      tick(300);

      expect(mockController.loadAddresses).not.toHaveBeenCalled();
    }));

    it('should clear addresses when search term is empty', fakeAsync(() => {
      component.searchTerm = '';
      component.onSearch();
      tick(300);

      expect(mockModelService.setAddresses).toHaveBeenCalledWith([]);
    }));

    it('should debounce search calls', fakeAsync(() => {
      component.searchTerm = 'Berlin';
      component.onSearch();
      tick(100);
      component.searchTerm = 'Munich';
      component.onSearch();
      tick(300);

      expect(mockController.loadAddresses).toHaveBeenCalledTimes(1);
      expect(mockController.loadAddresses).toHaveBeenCalledWith('Munich');
    }));

    it('should clear search and addresses', () => {
      component.searchTerm = 'Berlin';
      component.clearSearch();

      expect(component.searchTerm).toBe('');
      expect(mockModelService.setAddresses).toHaveBeenCalledWith([]);
    });
  });

  describe('form management', () => {
    it('should toggle add form and reset on show', () => {
      component.showAddForm = false;
      component.toggleAddForm();

      expect(component.showAddForm).toBeTrue();
      expect(component.formError).toBeNull();
      expect(component.newAddress.isVerified).toBeFalse();
    });

    it('should hide form when toggling off', () => {
      component.showAddForm = true;
      component.toggleAddForm();

      expect(component.showAddForm).toBeFalse();
    });

    it('should reset form with default country', () => {
      component.newAddress.streetLine1 = 'Test St';
      component.newAddress.city = 'Test City';
      component.formError = 'Some error';

      component.resetForm();

      expect(component.newAddress.streetLine1).toBeUndefined();
      expect(component.newAddress.city).toBeUndefined();
      expect(component.newAddress.countryCode).toBe('DE');
      expect(component.formError).toBeNull();
    });
  });

  describe('address creation', () => {
    it('should create address successfully', async () => {
      component.newAddress = {
        streetLine1: '789 New St',
        city: 'Hamburg',
        countryCode: 'DE',
        isVerified: false
      };
      component.showAddForm = true;

      await component.onSubmitAdd();

      expect(mockController.createAddress).toHaveBeenCalledWith(jasmine.objectContaining({
        streetLine1: '789 New St',
        city: 'Hamburg',
        countryCode: 'DE',
        isVerified: false
      }));
      expect(mockToastService.success).toHaveBeenCalledWith(
        'Address created successfully',
        7000,
        jasmine.objectContaining({
          label: '789 New St Hamburg'
        })
      );
      expect(component.showAddForm).toBeFalse();
    });

    it('should show error when street address is missing', async () => {
      component.newAddress = {
        streetLine1: '',
        city: 'Hamburg',
        countryCode: 'DE',
        isVerified: false
      };

      await component.onSubmitAdd();

      expect(component.formError).toBe('Street address is required');
      expect(mockController.createAddress).not.toHaveBeenCalled();
    });

    it('should show error when city is missing', async () => {
      component.newAddress = {
        streetLine1: '789 New St',
        city: '',
        countryCode: 'DE',
        isVerified: false
      };

      await component.onSubmitAdd();

      expect(component.formError).toBe('City is required');
      expect(mockController.createAddress).not.toHaveBeenCalled();
    });

    it('should show error when country code is missing', async () => {
      component.newAddress = {
        streetLine1: '789 New St',
        city: 'Hamburg',
        countryCode: '',
        isVerified: false
      };

      await component.onSubmitAdd();

      expect(component.formError).toBe('Country code is required');
      expect(mockController.createAddress).not.toHaveBeenCalled();
    });

    it('should handle creation error', async () => {
      component.newAddress = {
        streetLine1: '789 New St',
        city: 'Hamburg',
        countryCode: 'DE',
        isVerified: false
      };
      mockController.createAddress.and.rejectWith({ error: { detail: 'Database error' } });

      await component.onSubmitAdd();

      expect(component.formError).toBe('Database error');
      expect(component.formSubmitting).toBeFalse();
    });

    it('should handle creation error without detail', async () => {
      component.newAddress = {
        streetLine1: '789 New St',
        city: 'Hamburg',
        countryCode: 'DE',
        isVerified: false
      };
      mockController.createAddress.and.rejectWith({});

      await component.onSubmitAdd();

      expect(component.formError).toBe('Failed to create address. Please try again.');
    });
  });

  describe('address deletion', () => {
    it('should delete address when confirmed and retrigger search', async () => {
      const address = mockAddresses[0];
      mockConfirmService.confirm.and.resolveTo(true);
      component.searchTerm = 'test search';

      await component.deleteAddress(address);

      expect(mockConfirmService.confirm).toHaveBeenCalledWith({
        title: 'Delete Address',
        message: 'Are you sure you want to delete this address? This action cannot be undone.',
        confirmText: 'Delete',
        cancelText: 'Cancel',
        confirmClass: 'btn-danger'
      });
      expect(mockController.deleteAddress).toHaveBeenCalledWith('1');
      expect(mockToastService.success).toHaveBeenCalledWith('Address deleted successfully');
      expect(mockController.loadAddresses).toHaveBeenCalledWith('test search');
    });

    it('should not delete address when cancelled', async () => {
      const address = mockAddresses[0];
      mockConfirmService.confirm.and.resolveTo(false);

      await component.deleteAddress(address);

      expect(mockController.deleteAddress).not.toHaveBeenCalled();
      expect(mockToastService.success).not.toHaveBeenCalled();
    });

    it('should handle deletion error', async () => {
      const address = mockAddresses[0];
      mockConfirmService.confirm.and.resolveTo(true);
      mockController.deleteAddress.and.rejectWith(new Error('Network error'));

      await component.deleteAddress(address);

      expect(mockToastService.error).toHaveBeenCalledWith('Failed to delete address. Please try again.');
    });
  });

  describe('country autocomplete', () => {
    it('should fetch all countries when no search term', async () => {
      const result = await component.fetchCountries('');

      expect(result.length).toBe(3);
      expect(result[0]).toEqual({ value: 'DE', label: 'Germany' });
    });

    it('should filter countries by name', async () => {
      const result = await component.fetchCountries('Ger');

      expect(result.length).toBe(1);
      expect(result[0]).toEqual({ value: 'DE', label: 'Germany' });
    });

    it('should filter countries by code', async () => {
      const result = await component.fetchCountries('us');

      expect(result.length).toBe(1);
      expect(result[0]).toEqual({ value: 'US', label: 'United States' });
    });

    it('should be case insensitive', async () => {
      const result = await component.fetchCountries('FRANCE');

      expect(result.length).toBe(1);
      expect(result[0]).toEqual({ value: 'FR', label: 'France' });
    });
  });

  describe('result count and load time display', () => {
    it('should display result count when search term is present', () => {
      component.searchTerm = 'test';
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const filterInfo = compiled.querySelector('.filter-info');
      
      expect(filterInfo).toBeTruthy();
      expect(filterInfo?.textContent).toContain('Showing 2 result(s) for "test"');
    });

    it('should display load time when available', () => {
      // Create a new mock with load time
      const mockServiceWithTime = jasmine.createSpyObj('ModelService', ['setAddresses', 'getCountryName'], {
        addresses$: signal(mockAddresses),
        addressesLoading$: signal(false),
        addressesError$: signal(null),
        addressesLoadTime$: signal(456),
        countries$: signal(mockCountries),
        config$: signal({ defaultCountry: 'DE', logLevel: 'INFO' })
      });
      
      TestBed.overrideProvider(ModelService, { useValue: mockServiceWithTime });
      const newFixture = TestBed.createComponent(AddressComponent);
      const newComponent = newFixture.componentInstance;
      newComponent.searchTerm = 'test';
      newFixture.detectChanges();

      const compiled = newFixture.nativeElement as HTMLElement;
      const filterInfo = compiled.querySelector('.filter-info');
      
      expect(filterInfo?.textContent).toContain('(456ms)');
    });

    it('should not display load time when null', () => {
      component.searchTerm = 'test';
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const filterInfo = compiled.querySelector('.filter-info');
      
      expect(filterInfo?.textContent).not.toContain('ms)');
    });

    it('should not display filter info when search term is empty', () => {
      component.searchTerm = '';
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const filterInfo = compiled.querySelector('.filter-info');
      
      expect(filterInfo).toBeFalsy();
    });
  });
});
