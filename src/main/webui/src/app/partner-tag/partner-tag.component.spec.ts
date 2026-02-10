import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { signal } from '@angular/core';
import { PartnerTagComponent } from './partner-tag.component';
import { Controller } from '../controller';
import { ModelService } from '../model.service';
import { ToastService } from '../core/toast/toast.service';
import { ConfirmDialogService } from '../core/confirm-dialog/confirm-dialog.service';
import { PartnerService } from '../partner.service';
import { Tag, NaturalPerson } from '../models/partner.model';
import { PartnerDiscriminator } from '../models/partner-discriminator';

describe('PartnerTagComponent', () => {
  let component: PartnerTagComponent;
  let fixture: ComponentFixture<PartnerTagComponent>;
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

  const mockTags: Tag[] = [
    { id: '1', tagName: 'VIP', colorHex: '#FF5733', description: 'VIP Customer' },
    { id: '2', tagName: 'Premium', colorHex: '#3B82F6', description: 'Premium tier' },
    { id: '3', tagName: 'Corporate', colorHex: '#10B981', description: 'Corporate client' }
  ];

  const mockPartnerTags: Tag[] = [mockTags[0]];

  beforeEach(async () => {
    mockController = jasmine.createSpyObj('Controller', [
      'getPartnerById',
      'loadPartnerTags',
      'loadTags',
      'addTagToPartner',
      'createTag',
      'removeTagFromPartner'
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

    mockController.getPartnerById.and.resolveTo(mockPartner);
    mockController.loadPartnerTags.and.resolveTo(mockPartnerTags);
    mockController.loadTags.and.resolveTo(mockTags);
    mockController.addTagToPartner.and.resolveTo();
    mockController.createTag.and.resolveTo({ id: '4', tagName: 'New Tag', colorHex: '#FF0000' });
    mockController.removeTagFromPartner.and.resolveTo();
    mockPartnerService.getPartnerName.and.returnValue('John Doe');

    await TestBed.configureTestingModule({
      imports: [PartnerTagComponent],
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

    fixture = TestBed.createComponent(PartnerTagComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty forms', () => {
    expect(component.showAddForm).toBe(false);
    expect(component.showCreateForm).toBe(false);
    expect(component.selectedTagId).toBe('');
  });

  it('should load partner data, tags, and all tags on init', async () => {
    component.ngOnInit();
    await fixture.whenStable();

    expect(component.partnerId).toBe('123');
    expect(mockController.getPartnerById).toHaveBeenCalledWith('123');
    expect(mockController.loadPartnerTags).toHaveBeenCalledWith('123');
    expect(mockController.loadTags).toHaveBeenCalled();
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

  it('should load partner tags', async () => {
    component.partnerId = '123';
    await component.loadPartnerTags();

    expect(component.partnerTags).toEqual(mockPartnerTags);
    expect(component.loading).toBeFalse();
  });

  it('should handle error loading partner tags', async () => {
    component.partnerId = '123';
    mockController.loadPartnerTags.and.rejectWith(new Error('Network error'));

    await component.loadPartnerTags();

    expect(component.error).toBe('Failed to load partner tags');
    expect(mockToastService.error).toHaveBeenCalledWith('Failed to load partner tags');
    expect(component.loading).toBeFalse();
  });

  it('should load all tags', async () => {
    await component.loadAllTags();

    expect(component.allTags).toEqual(mockTags);
  });

  it('should toggle add form', () => {
    expect(component.showAddForm).toBe(false);
    component.toggleAddForm();
    expect(component.showAddForm).toBe(true);
    expect(component.showCreateForm).toBe(false);
    expect(component.selectedTagId).toBe('');
    component.toggleAddForm();
    expect(component.showAddForm).toBe(false);
  });

  it('should toggle create form', () => {
    expect(component.showCreateForm).toBe(false);
    component.toggleCreateForm();
    expect(component.showCreateForm).toBe(true);
    expect(component.showAddForm).toBe(false);
    component.toggleCreateForm();
    expect(component.showCreateForm).toBe(false);
  });

  it('should return empty tag with default color', () => {
    const emptyTag = component.getEmptyTag();
    expect(emptyTag.tagName).toBe('');
    expect(emptyTag.colorHex).toBe('#3B82F6');
    expect(emptyTag.description).toBe('');
  });

  it('should filter available tags correctly', () => {
    component.allTags = mockTags;
    component.partnerTags = [mockTags[0]];

    const available = component.getAvailableTags();
    expect(available.length).toBe(2);
    expect(available.find(t => t.id === '1')).toBeUndefined();
    expect(available.find(t => t.id === '2')).toBeDefined();
    expect(available.find(t => t.id === '3')).toBeDefined();
  });

  describe('adding existing tag', () => {
    beforeEach(() => {
      component.partnerId = '123';
    });

    it('should add existing tag successfully', async () => {
      component.selectedTagId = '2';

      await component.onAddExistingTag();

      expect(mockController.addTagToPartner).toHaveBeenCalledWith('123', '2');
      expect(mockToastService.success).toHaveBeenCalledWith('Tag added to partner');
      expect(component.showAddForm).toBeFalse();
      expect(component.selectedTagId).toBe('');
      expect(mockController.loadPartnerTags).toHaveBeenCalledWith('123');
    });

    it('should show error when no tag selected', async () => {
      component.selectedTagId = '';

      await component.onAddExistingTag();

      expect(mockToastService.error).toHaveBeenCalledWith('Please select a tag');
      expect(mockController.addTagToPartner).not.toHaveBeenCalled();
    });

    it('should handle error adding tag', async () => {
      component.selectedTagId = '2';
      mockController.addTagToPartner.and.rejectWith(new Error('Network error'));

      await component.onAddExistingTag();

      expect(mockToastService.error).toHaveBeenCalledWith('Failed to add tag to partner');
    });
  });

  describe('creating new tag', () => {
    beforeEach(() => {
      component.partnerId = '123';
    });

    it('should create new tag successfully without auto-adding to partner', async () => {
      component.newTag = {
        tagName: 'New Tag',
        colorHex: '#FF0000',
        description: 'Test tag'
      };

      await component.onCreateNewTag();

      expect(mockController.createTag).toHaveBeenCalledWith(jasmine.objectContaining({
        tagName: 'New Tag',
        colorHex: '#FF0000',
        description: 'Test tag'
      }));
      // Should NOT automatically add to partner
      expect(mockController.addTagToPartner).not.toHaveBeenCalled();
      expect(mockToastService.success).toHaveBeenCalledWith('Tag created successfully. You can now search and add it to the partner.');
      expect(component.showCreateForm).toBeFalse();
      // Should NOT reload partner tags since tag wasn't added
      expect(mockController.loadPartnerTags).not.toHaveBeenCalled();
      // Should reload all tags so new tag appears in the list
      expect(mockController.loadTags).toHaveBeenCalled();
    });

    it('should show error when tag name is empty', async () => {
      component.newTag = {
        tagName: '',
        colorHex: '#FF0000'
      };

      await component.onCreateNewTag();

      expect(mockToastService.error).toHaveBeenCalledWith('Please enter a tag name');
      expect(mockController.createTag).not.toHaveBeenCalled();
    });

    it('should show error when tag name is whitespace', async () => {
      component.newTag = {
        tagName: '   ',
        colorHex: '#FF0000'
      };

      await component.onCreateNewTag();

      expect(mockToastService.error).toHaveBeenCalledWith('Please enter a tag name');
      expect(mockController.createTag).not.toHaveBeenCalled();
    });

    it('should handle error creating tag', async () => {
      component.newTag = {
        tagName: 'New Tag',
        colorHex: '#FF0000'
      };
      mockController.createTag.and.rejectWith(new Error('Network error'));

      await component.onCreateNewTag();

      expect(mockToastService.error).toHaveBeenCalledWith('Failed to create tag');
    });
  });

  describe('removing tag', () => {
    beforeEach(() => {
      component.partnerId = '123';
    });

    it('should remove tag when confirmed', async () => {
      mockConfirmService.confirm.and.resolveTo(true);

      await component.onRemoveTag(mockTags[0]);

      expect(mockConfirmService.confirm).toHaveBeenCalledWith({
        title: 'Remove Tag',
        message: 'Are you sure you want to remove the tag "VIP" from this partner?'
      });
      expect(mockController.removeTagFromPartner).toHaveBeenCalledWith('123', '1');
      expect(mockToastService.success).toHaveBeenCalledWith('Tag removed from partner');
      expect(mockController.loadPartnerTags).toHaveBeenCalledWith('123');
    });

    it('should not remove tag when cancelled', async () => {
      mockConfirmService.confirm.and.resolveTo(false);

      await component.onRemoveTag(mockTags[0]);

      expect(mockController.removeTagFromPartner).not.toHaveBeenCalled();
    });

    it('should handle error removing tag', async () => {
      mockConfirmService.confirm.and.resolveTo(true);
      mockController.removeTagFromPartner.and.rejectWith(new Error('Network error'));

      await component.onRemoveTag(mockTags[0]);

      expect(mockToastService.error).toHaveBeenCalledWith('Failed to remove tag from partner');
    });

    it('should not remove tag without id', async () => {
      mockConfirmService.confirm.and.resolveTo(true);
      const tagWithoutId: Tag = {
        tagName: 'Test',
        colorHex: '#FF0000'
      };

      await component.onRemoveTag(tagWithoutId);

      expect(mockController.removeTagFromPartner).not.toHaveBeenCalled();
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

    it('should calculate contrast color correctly', () => {
      // Light color should return black text
      expect(component.getContrastColor('#FFFFFF')).toBe('#000000');
      expect(component.getContrastColor('#FFFF00')).toBe('#000000');
      // Dark color should return white text
      expect(component.getContrastColor('#000000')).toBe('#FFFFFF');
      expect(component.getContrastColor('#0000FF')).toBe('#FFFFFF');
    });

    it('should get tag style with color', () => {
      const tag = { id: '1', tagName: 'Test', colorHex: '#FF5733' };
      const style = component.getTagStyle(tag);
      expect(style['background-color']).toBe('#FF5733');
      expect(style['color']).toBeDefined();
    });

    it('should use default color when tag has no color', () => {
      const tag = { id: '1', tagName: 'Test' };
      const style = component.getTagStyle(tag);
      expect(style['background-color']).toBe('#3B82F6');
    });
  });

  it('should go back', () => {
    component.goBack();
    expect(mockLocation.back).toHaveBeenCalled();
  });
});
