import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { signal } from '@angular/core';
import { PartnerComponent } from './partner.component';
import { Controller } from '../controller';
import { ModelService, Partner, NaturalPerson, LegalEntity } from '../model.service';
import { PartnerService } from '../partner.service';
import { ToastService } from '../core/toast/toast.service';
import { ConfirmDialogService } from '../core/confirm-dialog/confirm-dialog.service';
import { PartnerDiscriminator } from '../models/partner-discriminator';

describe('PartnerComponent', () => {
  let component: PartnerComponent;
  let fixture: ComponentFixture<PartnerComponent>;
  let mockController: jasmine.SpyObj<Controller>;
  let mockModelService: jasmine.SpyObj<ModelService>;
  let mockPartnerService: jasmine.SpyObj<PartnerService>;
  let mockToastService: jasmine.SpyObj<ToastService>;
  let mockConfirmService: jasmine.SpyObj<ConfirmDialogService>;
  let mockRouter: jasmine.SpyObj<Router>;

  const mockNaturalPerson: NaturalPerson = {
    id: '1',
    partnerNumber: 'P00000001',
    partnerType: PartnerDiscriminator.NATURAL_PERSON,
    active: true,
    firstName: 'John',
    lastName: 'Doe'
  };

  const mockLegalEntity: LegalEntity = {
    id: '2',
    partnerNumber: 'P00000002',
    partnerType: PartnerDiscriminator.LEGAL_ENTITY,
    active: true,
    legalName: 'Acme Corp'
  };

  beforeEach(async () => {
    mockController = jasmine.createSpyObj('Controller', [
      'loadPartners',
      'createPartner',
      'updatePartner',
      'deletePartner'
    ]);
    
    mockModelService = jasmine.createSpyObj('ModelService', ['setPartners'], {
      partners$: signal([mockNaturalPerson, mockLegalEntity]),
      partnersLoading$: signal(false),
      partnersError$: signal(null)
    });

    mockPartnerService = jasmine.createSpyObj('PartnerService', ['getPartnerName']);
    mockToastService = jasmine.createSpyObj('ToastService', ['success', 'error']);
    mockConfirmService = jasmine.createSpyObj('ConfirmDialogService', ['confirm']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate', 'getCurrentNavigation']);

    mockController.loadPartners.and.resolveTo();
    mockController.createPartner.and.resolveTo();
    mockController.updatePartner.and.resolveTo();
    mockController.deletePartner.and.resolveTo();
    mockPartnerService.getPartnerName.and.callFake((p: Partner) => {
      const np = p as NaturalPerson;
      const le = p as LegalEntity;
      return np.firstName ? `${np.firstName} ${np.lastName}` : le.legalName || '';
    });
    mockRouter.getCurrentNavigation.and.returnValue(null);

    await TestBed.configureTestingModule({
      imports: [PartnerComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: Controller, useValue: mockController },
        { provide: ModelService, useValue: mockModelService },
        { provide: PartnerService, useValue: mockPartnerService },
        { provide: ToastService, useValue: mockToastService },
        { provide: ConfirmDialogService, useValue: mockConfirmService },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PartnerComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should sort partners alphabetically', () => {
    const sorted = component.partners();
    expect(sorted[0].id).toBe('2'); // Acme Corp comes before John Doe
    expect(sorted[1].id).toBe('1');
  });

  describe('search functionality', () => {
    it('should search partners when search term is 3 or more characters', fakeAsync(() => {
      component.searchTerm = 'John';
      component.onSearch();
      tick(300);

      expect(mockController.loadPartners).toHaveBeenCalledWith('John');
    }));

    it('should not search when search term is less than 3 characters', fakeAsync(() => {
      component.searchTerm = 'Jo';
      component.onSearch();
      tick(300);

      expect(mockController.loadPartners).not.toHaveBeenCalled();
    }));

    it('should clear partners when search term is empty', fakeAsync(() => {
      component.searchTerm = '';
      component.onSearch();
      tick(300);

      expect(mockModelService.setPartners).toHaveBeenCalledWith([]);
    }));

    it('should debounce search calls', fakeAsync(() => {
      component.searchTerm = 'John';
      component.onSearch();
      tick(100);
      component.searchTerm = 'Jane';
      component.onSearch();
      tick(300);

      expect(mockController.loadPartners).toHaveBeenCalledTimes(1);
      expect(mockController.loadPartners).toHaveBeenCalledWith('Jane');
    }));

    it('should clear search and partners', () => {
      component.searchTerm = 'John';
      component.clearSearch();

      expect(component.searchTerm).toBe('');
      expect(mockModelService.setPartners).toHaveBeenCalledWith([]);
    });
  });

  describe('form management', () => {
    it('should toggle add form and reset', () => {
      component.showAddForm = false;
      component.toggleAddForm();

      expect(component.showAddForm).toBeTrue();
      expect(component.editingPartner).toBeNull();
      expect(component.partnerType).toBeNull();
    });

    it('should hide form when toggling off', () => {
      component.showAddForm = true;
      component.toggleAddForm();

      expect(component.showAddForm).toBeFalse();
    });

    it('should reset form to defaults', () => {
      component.partnerType = 'natural';
      component.newNaturalPerson.firstName = 'Test';
      component.formError = 'Some error';

      component.resetForm();

      expect(component.partnerType).toBeNull();
      expect(component.newNaturalPerson.firstName).toBeUndefined();
      expect(component.newNaturalPerson.active).toBeTrue();
      expect(component.formError).toBeNull();
    });

    it('should select natural person type', () => {
      component.selectPartnerType('natural');

      expect(component.partnerType).toBe('natural');
      expect(component.newNaturalPerson.active).toBeTrue();
    });

    it('should select legal entity type', () => {
      component.selectPartnerType('legal');

      expect(component.partnerType).toBe('legal');
      expect(component.newLegalEntity.active).toBeTrue();
    });
  });

  describe('partner creation', () => {
    it('should create natural person successfully', async () => {
      component.partnerType = 'natural';
      component.newNaturalPerson = {
        firstName: 'Jane',
        lastName: 'Smith',
        active: true
      };

      await component.onSubmitAdd();

      expect(mockController.createPartner).toHaveBeenCalledWith(jasmine.objectContaining({
        firstName: 'Jane',
        lastName: 'Smith',
        partnerType: PartnerDiscriminator.NATURAL_PERSON
      }));
      expect(mockToastService.success).toHaveBeenCalledWith(
        'Partner created successfully',
        7000,
        jasmine.objectContaining({
          label: 'P00001'
        })
      );
      expect(component.showAddForm).toBeFalse();
    });

    it('should create legal entity successfully', async () => {
      component.partnerType = 'legal';
      component.newLegalEntity = {
        legalName: 'Test Corp',
        active: true
      };

      await component.onSubmitAdd();

      expect(mockController.createPartner).toHaveBeenCalledWith(jasmine.objectContaining({
        legalName: 'Test Corp',
        partnerType: PartnerDiscriminator.LEGAL_ENTITY
      }));
      expect(mockToastService.success).toHaveBeenCalledWith(
        'Partner created successfully',
        7000,
        jasmine.objectContaining({
          label: 'P00001'
        })
      );
    });

    it('should show error when partner type not selected', async () => {
      component.partnerType = null;

      await component.onSubmitAdd();

      expect(component.formError).toBe('Please select partner type');
      expect(mockController.createPartner).not.toHaveBeenCalled();
    });

    it('should handle creation error', async () => {
      component.partnerType = 'natural';
      component.newNaturalPerson = { firstName: 'Jane', lastName: 'Smith', active: true };
      mockController.createPartner.and.rejectWith({ error: { detail: 'Database error' } });

      await component.onSubmitAdd();

      expect(component.formError).toBe('Database error');
      expect(component.formSubmitting).toBeFalse();
    });

    it('should handle creation error without detail', async () => {
      component.partnerType = 'natural';
      component.newNaturalPerson = { firstName: 'Jane', lastName: 'Smith', active: true };
      mockController.createPartner.and.rejectWith({});

      await component.onSubmitAdd();

      expect(component.formError).toBe('Failed to create partner. Please try again.');
    });
  });

  describe('partner editing', () => {
    it('should populate form for editing natural person', () => {
      component.editPartner(mockNaturalPerson);

      expect(component.editingPartner).toEqual(mockNaturalPerson);
      expect(component.showAddForm).toBeTrue();
      expect(component.partnerType).toBe('natural');
      expect(component.newNaturalPerson.firstName).toBe('John');
      expect(component.newNaturalPerson.lastName).toBe('Doe');
    });

    it('should populate form for editing legal entity', () => {
      component.editPartner(mockLegalEntity);

      expect(component.editingPartner).toEqual(mockLegalEntity);
      expect(component.showAddForm).toBeTrue();
      expect(component.partnerType).toBe('legal');
      expect(component.newLegalEntity.legalName).toBe('Acme Corp');
    });

    it('should update partner successfully', async () => {
      component.editingPartner = mockNaturalPerson;
      component.partnerType = 'natural';
      component.newNaturalPerson = {
        firstName: 'John',
        lastName: 'Updated',
        active: true
      };

      await component.onSubmitAdd();

      expect(mockController.updatePartner).toHaveBeenCalled();
      expect(mockToastService.success).toHaveBeenCalledWith('Partner updated successfully');
      expect(component.editingPartner).toBeNull();
    });

    it('should handle update error', async () => {
      component.editingPartner = mockNaturalPerson;
      component.partnerType = 'natural';
      component.newNaturalPerson = { firstName: 'John', lastName: 'Doe', active: true };
      mockController.updatePartner.and.rejectWith({ error: { detail: 'Update failed' } });

      await component.onSubmitAdd();

      expect(component.formError).toBe('Update failed');
    });
  });

  describe('partner deletion', () => {
    it('should delete partner when confirmed', async () => {
      mockConfirmService.confirm.and.resolveTo(true);

      await component.deletePartner(mockNaturalPerson);

      expect(mockConfirmService.confirm).toHaveBeenCalledWith({
        title: 'Delete Partner',
        message: 'Are you sure you want to delete partner "P00000001"? This action cannot be undone.',
        confirmText: 'Delete',
        cancelText: 'Cancel',
        confirmClass: 'btn-danger'
      });
      expect(mockController.deletePartner).toHaveBeenCalledWith('1');
      expect(mockToastService.success).toHaveBeenCalledWith('Partner deleted successfully');
    });

    it('should not delete partner when cancelled', async () => {
      mockConfirmService.confirm.and.resolveTo(false);

      await component.deletePartner(mockNaturalPerson);

      expect(mockController.deletePartner).not.toHaveBeenCalled();
    });

    it('should handle deletion error', async () => {
      mockConfirmService.confirm.and.resolveTo(true);
      mockController.deletePartner.and.rejectWith(new Error('Network error'));

      await component.deletePartner(mockNaturalPerson);

      expect(mockToastService.error).toHaveBeenCalledWith('Failed to delete partner. Please try again.');
    });
  });

  describe('navigation', () => {
    it('should navigate to partner overview', () => {
      component.viewOverview(mockNaturalPerson);

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/partners', '1']);
    });

    it('should navigate to manage addresses', () => {
      component.manageAddresses(mockNaturalPerson);

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/partners', '1', 'addresses']);
    });

    it('should navigate to manage contacts', () => {
      component.manageContacts(mockNaturalPerson);

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/partners', '1', 'contacts']);
    });

    it('should navigate to manage tags', () => {
      component.manageTags(mockNaturalPerson);

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/partners', '1', 'tags']);
    });
  });

  it('should retry loading partners', () => {
    component.onRetry();
    expect(mockController.loadPartners).toHaveBeenCalled();
  });

  it('should load partner for editing from navigation state', async () => {
    mockRouter.getCurrentNavigation.and.returnValue({
      extras: { state: { editPartnerId: '1' } }
    } as any);

    await component.ngOnInit();

    expect(mockController.loadPartners).toHaveBeenCalled();
  });
});
