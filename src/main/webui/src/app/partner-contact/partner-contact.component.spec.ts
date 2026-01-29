import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { signal } from '@angular/core';
import { PartnerContactComponent } from './partner-contact.component';
import { Controller } from '../controller';
import { ModelService } from '../model.service';
import { ToastService } from '../core/toast/toast.service';
import { ConfirmDialogService } from '../core/confirm-dialog/confirm-dialog.service';
import { PartnerService } from '../partner.service';
import { ContactDetail } from '../models/contact-detail.model';
import { NaturalPerson } from '../models/partner.model';
import { PartnerDiscriminator } from '../models/partner-discriminator';

describe('PartnerContactComponent', () => {
  let component: PartnerContactComponent;
  let fixture: ComponentFixture<PartnerContactComponent>;
  let mockController: jasmine.SpyObj<Controller>;
  let mockModelService: jasmine.SpyObj<ModelService>;
  let mockToastService: jasmine.SpyObj<ToastService>;
  let mockConfirmService: jasmine.SpyObj<ConfirmDialogService>;
  let mockPartnerService: jasmine.SpyObj<PartnerService>;
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

  const mockContacts: ContactDetail[] = [
    {
      id: '1',
      contactType: 'EMAIL',
      contactValue: 'john@example.com',
      isPrimary: true,
      isVerified: true
    },
    {
      id: '2',
      contactType: 'PHONE',
      contactValue: '+1234567890',
      isPrimary: false,
      isVerified: false
    }
  ];

  beforeEach(async () => {
    mockController = jasmine.createSpyObj('Controller', [
      'loadPartners',
      'loadPartnerContacts',
      'addContactToPartner',
      'updateContact',
      'removeContactFromPartner'
    ]);
    
    mockModelService = jasmine.createSpyObj('ModelService', [], {
      partners$: signal([mockPartner])
    });

    mockToastService = jasmine.createSpyObj('ToastService', ['success', 'error']);
    mockConfirmService = jasmine.createSpyObj('ConfirmDialogService', ['confirm']);
    mockPartnerService = jasmine.createSpyObj('PartnerService', ['getPartnerName']);
    mockLocation = jasmine.createSpyObj('Location', ['back']);

    mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: jasmine.createSpy('get').and.returnValue('123')
        }
      }
    };

    mockController.loadPartners.and.resolveTo();
    mockController.loadPartnerContacts.and.resolveTo(mockContacts);
    mockController.addContactToPartner.and.resolveTo();
    mockController.updateContact.and.resolveTo();
    mockController.removeContactFromPartner.and.resolveTo();
    mockPartnerService.getPartnerName.and.returnValue('John Doe');

    await TestBed.configureTestingModule({
      imports: [PartnerContactComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: Controller, useValue: mockController },
        { provide: ModelService, useValue: mockModelService },
        { provide: ToastService, useValue: mockToastService },
        { provide: ConfirmDialogService, useValue: mockConfirmService },
        { provide: PartnerService, useValue: mockPartnerService },
        { provide: Location, useValue: mockLocation },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PartnerContactComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty form', () => {
    expect(component.showForm).toBe(false);
    expect(component.editingContact).toBeNull();
    expect(component.contactForm.isPrimary).toBe(false);
    expect(component.contactForm.isVerified).toBe(false);
  });

  it('should load partner data and contacts on init', async () => {
    component.ngOnInit();
    await fixture.whenStable();

    expect(component.partnerId).toBe('123');
    expect(mockController.loadPartners).toHaveBeenCalled();
    expect(mockController.loadPartnerContacts).toHaveBeenCalledWith('123');
  });

  it('should set partner from loaded data', async () => {
    component.partnerId = '123';
    await component.loadPartnerData();

    expect(component.partner).toEqual(mockPartner);
  });

  it('should show error when partner not found', async () => {
    component.partnerId = '999';
    (mockModelService.partners$ as any) = signal([]);

    await component.loadPartnerData();

    expect(component.error).toBe('Partner not found');
    expect(mockToastService.error).toHaveBeenCalledWith('Partner not found');
  });

  it('should load partner contacts', async () => {
    component.partnerId = '123';
    await component.loadPartnerContacts();

    expect(component.partnerContacts).toEqual(mockContacts);
    expect(component.loading).toBeFalse();
  });

  it('should handle error loading partner contacts', async () => {
    component.partnerId = '123';
    mockController.loadPartnerContacts.and.rejectWith(new Error('Network error'));

    await component.loadPartnerContacts();

    expect(component.error).toBe('Failed to load partner contacts');
    expect(mockToastService.error).toHaveBeenCalledWith('Failed to load partner contacts');
    expect(component.loading).toBeFalse();
  });

  it('should toggle add form', () => {
    expect(component.showForm).toBe(false);
    component.toggleAddForm();
    expect(component.showForm).toBe(true);
    component.toggleAddForm();
    expect(component.showForm).toBe(false);
  });

  it('should reset form correctly', () => {
    component.contactForm.contactValue = 'test@example.com';
    component.contactForm.isPrimary = true;
    component.editingContact = { id: '123', isPrimary: false, isVerified: false, contactType: 'EMAIL', contactValue: 'old@example.com' };
    
    component.resetForm();
    
    expect(component.editingContact).toBeNull();
    expect(component.contactForm.contactValue).toBeUndefined();
    expect(component.contactForm.isPrimary).toBe(false);
    expect(component.contactForm.contactType).toBe('EMAIL');
  });

  describe('contact submission', () => {
    beforeEach(() => {
      component.partnerId = '123';
    });

    it('should add new contact successfully', async () => {
      component.contactForm = {
        contactType: 'EMAIL',
        contactValue: 'new@example.com',
        isPrimary: false,
        isVerified: false
      };

      await component.onSubmit();

      expect(mockController.addContactToPartner).toHaveBeenCalledWith('123', jasmine.objectContaining({
        contactType: 'EMAIL',
        contactValue: 'new@example.com',
        isPrimary: false,
        isVerified: false
      }));
      expect(mockToastService.success).toHaveBeenCalledWith('Contact added successfully');
      expect(component.showForm).toBeFalse();
      expect(mockController.loadPartnerContacts).toHaveBeenCalledWith('123');
    });

    it('should update existing contact successfully', async () => {
      component.editingContact = mockContacts[0];
      component.contactForm = {
        id: '1',
        contactType: 'EMAIL',
        contactValue: 'updated@example.com',
        isPrimary: true,
        isVerified: true
      };

      await component.onSubmit();

      expect(mockController.updateContact).toHaveBeenCalledWith('123', '1', jasmine.objectContaining({
        id: '1',
        contactType: 'EMAIL',
        contactValue: 'updated@example.com',
        isPrimary: true,
        isVerified: true
      }));
      expect(mockToastService.success).toHaveBeenCalledWith('Contact updated successfully');
      expect(component.showForm).toBeFalse();
    });

    it('should show error when contact value is missing', async () => {
      component.contactForm = {
        contactType: 'EMAIL',
        contactValue: '',
        isPrimary: false,
        isVerified: false
      };

      await component.onSubmit();

      expect(mockToastService.error).toHaveBeenCalledWith('Please fill in all required fields');
      expect(mockController.addContactToPartner).not.toHaveBeenCalled();
    });

    it('should show error when contact type is missing', async () => {
      component.contactForm = {
        contactType: '',
        contactValue: 'test@example.com',
        isPrimary: false,
        isVerified: false
      };

      await component.onSubmit();

      expect(mockToastService.error).toHaveBeenCalledWith('Please fill in all required fields');
      expect(mockController.addContactToPartner).not.toHaveBeenCalled();
    });

    it('should handle error adding contact', async () => {
      component.contactForm = {
        contactType: 'EMAIL',
        contactValue: 'new@example.com',
        isPrimary: false,
        isVerified: false
      };
      mockController.addContactToPartner.and.rejectWith(new Error('Network error'));

      await component.onSubmit();

      expect(mockToastService.error).toHaveBeenCalledWith('Failed to add contact');
    });

    it('should handle error updating contact', async () => {
      component.editingContact = mockContacts[0];
      component.contactForm = { ...mockContacts[0], contactValue: 'updated@example.com' };
      mockController.updateContact.and.rejectWith(new Error('Network error'));

      await component.onSubmit();

      expect(mockToastService.error).toHaveBeenCalledWith('Failed to update contact');
    });
  });

  describe('contact editing', () => {
    it('should populate form for editing', () => {
      component.onEdit(mockContacts[0]);

      expect(component.editingContact).toEqual(mockContacts[0]);
      expect(component.contactForm).toEqual(mockContacts[0]);
      expect(component.showForm).toBeTrue();
    });
  });

  describe('contact deletion', () => {
    beforeEach(() => {
      component.partnerId = '123';
    });

    it('should delete contact when confirmed', async () => {
      mockConfirmService.confirm.and.resolveTo(true);

      await component.onDelete(mockContacts[0]);

      expect(mockConfirmService.confirm).toHaveBeenCalledWith({
        title: 'Remove Contact',
        message: 'Are you sure you want to remove this contact from the partner?'
      });
      expect(mockController.removeContactFromPartner).toHaveBeenCalledWith('123', '1');
      expect(mockToastService.success).toHaveBeenCalledWith('Contact removed successfully');
      expect(mockController.loadPartnerContacts).toHaveBeenCalledWith('123');
    });

    it('should not delete contact when cancelled', async () => {
      mockConfirmService.confirm.and.resolveTo(false);

      await component.onDelete(mockContacts[0]);

      expect(mockController.removeContactFromPartner).not.toHaveBeenCalled();
    });

    it('should handle deletion error', async () => {
      mockConfirmService.confirm.and.resolveTo(true);
      mockController.removeContactFromPartner.and.rejectWith(new Error('Network error'));

      await component.onDelete(mockContacts[0]);

      expect(mockToastService.error).toHaveBeenCalledWith('Failed to remove contact');
    });

    it('should not delete contact without id', async () => {
      mockConfirmService.confirm.and.resolveTo(true);
      const contactWithoutId: ContactDetail = {
        contactType: 'EMAIL',
        contactValue: 'test@example.com',
        isPrimary: false,
        isVerified: false
      };

      await component.onDelete(contactWithoutId);

      expect(mockController.removeContactFromPartner).not.toHaveBeenCalled();
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

    it('should return correct contact type icon', () => {
      expect(component.getContactTypeIcon('EMAIL')).toBe('📧');
      expect(component.getContactTypeIcon('PHONE')).toBe('📞');
      expect(component.getContactTypeIcon('MOBILE')).toBe('📱');
      expect(component.getContactTypeIcon('FAX')).toBe('📠');
      expect(component.getContactTypeIcon('WEBSITE')).toBe('🌐');
      expect(component.getContactTypeIcon('LINKEDIN')).toBe('💼');
      expect(component.getContactTypeIcon('OTHER')).toBe('📋');
      expect(component.getContactTypeIcon('UNKNOWN')).toBe('📋');
    });

    it('should handle case insensitive contact type icons', () => {
      expect(component.getContactTypeIcon('email')).toBe('📧');
      expect(component.getContactTypeIcon('Phone')).toBe('📞');
    });
  });

  it('should go back', () => {
    component.goBack();
    expect(mockLocation.back).toHaveBeenCalled();
  });

  it('should get empty contact with defaults', () => {
    const emptyContact = component.getEmptyContact();

    expect(emptyContact.isPrimary).toBeFalse();
    expect(emptyContact.isVerified).toBeFalse();
    expect(emptyContact.contactType).toBe('EMAIL');
  });
});
