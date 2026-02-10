import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TagComponent } from './tag.component';
import { Controller } from '../controller';
import { ToastService } from '../core/toast/toast.service';
import { ConfirmDialogService } from '../core/confirm-dialog/confirm-dialog.service';
import { Tag } from '../models/partner.model';

describe('TagComponent', () => {
  let component: TagComponent;
  let fixture: ComponentFixture<TagComponent>;
  let mockController: jasmine.SpyObj<Controller>;
  let mockToastService: jasmine.SpyObj<ToastService>;
  let mockConfirmService: jasmine.SpyObj<ConfirmDialogService>;

  const mockTags: Tag[] = [
    {
      id: '1',
      tagName: 'VIP',
      colorHex: '#ff0000',
      description: 'Very Important Person'
    },
    {
      id: '2',
      tagName: 'Premium',
      colorHex: '#00ff00',
      description: 'Premium customer'
    },
    {
      id: '3',
      tagName: 'Corporate',
      colorHex: '#0000ff',
      description: 'Corporate client'
    }
  ];

  beforeEach(async () => {
    mockController = jasmine.createSpyObj('Controller', [
      'loadTags',
      'createTag',
      'updateTag',
      'deleteTag'
    ]);
    
    mockToastService = jasmine.createSpyObj('ToastService', ['success', 'error']);
    mockConfirmService = jasmine.createSpyObj('ConfirmDialogService', ['confirm']);

    mockController.loadTags.and.resolveTo(mockTags);
    mockController.createTag.and.callFake(async (tag: Tag) => {
      return { ...tag, id: 'new-id' };
    });
    mockController.updateTag.and.callFake(async (id: string, tag: Tag) => {
      return { ...tag, id };
    });
    mockController.deleteTag.and.resolveTo();

    await TestBed.configureTestingModule({
      imports: [TagComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Controller, useValue: mockController },
        { provide: ToastService, useValue: mockToastService },
        { provide: ConfirmDialogService, useValue: mockConfirmService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TagComponent);
    component = fixture.componentInstance;
    // Don't call detectChanges here to prevent ngOnInit from running automatically
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('initialization', () => {
    it('should load tags on init', async () => {
      await component.ngOnInit();
      
      expect(mockController.loadTags).toHaveBeenCalled();
      expect(component.tags).toEqual(mockTags);
      expect(component.loading).toBeFalse();
    });

    it('should handle load error on init', async () => {
      mockController.loadTags.and.rejectWith(new Error('Network error'));
      
      await component.ngOnInit();
      
      expect(component.error).toBe('Failed to load tags');
      expect(mockToastService.error).toHaveBeenCalledWith('Failed to load tags');
      expect(component.loading).toBeFalse();
    });
  });

  describe('search functionality', () => {
    it('should search tags with debounce', fakeAsync(() => {
      component.searchTerm = 'VIP';
      component.onSearchChange();
      
      expect(mockController.loadTags).not.toHaveBeenCalled();
      
      tick(300);
      
      expect(mockController.loadTags).toHaveBeenCalledWith('VIP');
    }));

    it('should debounce multiple search changes', fakeAsync(() => {
      component.searchTerm = 'V';
      component.onSearchChange();
      tick(100);
      
      component.searchTerm = 'VI';
      component.onSearchChange();
      tick(100);
      
      component.searchTerm = 'VIP';
      component.onSearchChange();
      tick(300);
      
      expect(mockController.loadTags).toHaveBeenCalledTimes(1);
      expect(mockController.loadTags).toHaveBeenCalledWith('VIP');
    }));

    it('should clear search and reload all tags', async () => {
      component.searchTerm = 'VIP';
      
      component.clearSearch();
      
      expect(component.searchTerm).toBe('');
      expect(mockController.loadTags).toHaveBeenCalledWith(undefined);
    });
  });

  describe('form management', () => {
    it('should toggle form to show', () => {
      component.showForm = false;
      component.toggleAddForm();
      
      expect(component.showForm).toBeTrue();
      expect(component.editingTag).toBeNull();
      expect(component.tagForm.tagName).toBe('');
      expect(component.tagForm.colorHex).toBe('#4285f4');
    });

    it('should toggle form to hide and reset', () => {
      component.showForm = true;
      component.tagForm.tagName = 'Test';
      component.toggleAddForm();
      
      expect(component.showForm).toBeFalse();
      expect(component.editingTag).toBeNull();
      expect(component.tagForm.tagName).toBe('');
    });

    it('should reset form to default values', () => {
      component.tagForm = {
        tagName: 'Test Tag',
        colorHex: '#ff0000',
        description: 'Test description'
      };
      component.formError = 'Some error';
      
      component.resetForm();
      
      expect(component.tagForm.tagName).toBe('');
      expect(component.tagForm.colorHex).toBe('#4285f4');
      expect(component.tagForm.description).toBe('');
      expect(component.formError).toBeNull();
    });

    it('should cancel form and reset', () => {
      component.showForm = true;
      component.editingTag = mockTags[0];
      component.tagForm.tagName = 'Test';
      
      component.cancelForm();
      
      expect(component.showForm).toBeFalse();
      expect(component.editingTag).toBeNull();
      expect(component.tagForm.tagName).toBe('');
    });
  });

  describe('tag creation', () => {
    it('should create tag successfully', async () => {
      component.tagForm = {
        tagName: 'New Tag',
        colorHex: '#ff00ff',
        description: 'New tag description'
      };
      
      await component.onSubmit();
      
      expect(mockController.createTag).toHaveBeenCalledWith({
        tagName: 'New Tag',
        colorHex: '#ff00ff',
        description: 'New tag description'
      });
      expect(mockToastService.success).toHaveBeenCalledWith('Tag created successfully');
      expect(component.showForm).toBeFalse();
      expect(component.editingTag).toBeNull();
    });

    it('should show error when tag name is missing', async () => {
      component.tagForm = {
        tagName: '',
        colorHex: '#ff00ff',
        description: 'Test'
      };
      
      await component.onSubmit();
      
      expect(component.formError).toBe('Tag name is required');
      expect(mockController.createTag).not.toHaveBeenCalled();
    });

    it('should show error when tag name is only whitespace', async () => {
      component.tagForm = {
        tagName: '   ',
        colorHex: '#ff00ff',
        description: 'Test'
      };
      
      await component.onSubmit();
      
      expect(component.formError).toBe('Tag name is required');
      expect(mockController.createTag).not.toHaveBeenCalled();
    });

    it('should handle creation error with message', async () => {
      component.tagForm = {
        tagName: 'Duplicate Tag',
        colorHex: '#ff00ff'
      };
      mockController.createTag.and.rejectWith({ 
        error: { message: 'Tag name already exists' } 
      });
      
      await component.onSubmit();
      
      expect(component.formError).toBe('Tag name already exists');
      expect(mockToastService.error).toHaveBeenCalledWith('Tag name already exists');
      expect(component.formSubmitting).toBeFalse();
    });

    it('should handle creation error without message', async () => {
      component.tagForm = {
        tagName: 'New Tag',
        colorHex: '#ff00ff'
      };
      mockController.createTag.and.rejectWith({});
      
      await component.onSubmit();
      
      expect(component.formError).toBe('Failed to save tag');
      expect(mockToastService.error).toHaveBeenCalledWith('Failed to save tag');
    });
  });

  describe('tag editing', () => {
    it('should populate form for editing', () => {
      const tag = mockTags[0];
      
      component.onEdit(tag);
      
      expect(component.editingTag).toBe(tag);
      expect(component.tagForm.tagName).toBe('VIP');
      expect(component.tagForm.colorHex).toBe('#ff0000');
      expect(component.tagForm.description).toBe('Very Important Person');
      expect(component.showForm).toBeTrue();
    });

    it('should use default color when tag has no color', () => {
      const tag: Tag = {
        id: '4',
        tagName: 'No Color',
        description: 'Tag without color'
      };
      
      component.onEdit(tag);
      
      expect(component.tagForm.colorHex).toBe('#4285f4');
    });

    it('should update tag successfully', async () => {
      component.editingTag = mockTags[0];
      component.tagForm = {
        tagName: 'Updated VIP',
        colorHex: '#ff0000',
        description: 'Updated description'
      };
      
      await component.onSubmit();
      
      expect(mockController.updateTag).toHaveBeenCalledWith('1', {
        tagName: 'Updated VIP',
        colorHex: '#ff0000',
        description: 'Updated description'
      });
      expect(mockToastService.success).toHaveBeenCalledWith('Tag updated successfully');
      expect(component.showForm).toBeFalse();
    });

    it('should handle update error', async () => {
      component.editingTag = mockTags[0];
      component.tagForm = {
        tagName: 'Updated VIP',
        colorHex: '#ff0000'
      };
      mockController.updateTag.and.rejectWith({ 
        error: { message: 'Update failed' } 
      });
      
      await component.onSubmit();
      
      expect(component.formError).toBe('Update failed');
      expect(mockToastService.error).toHaveBeenCalledWith('Update failed');
      expect(component.formSubmitting).toBeFalse();
    });
  });

  describe('tag deletion', () => {
    it('should delete tag when confirmed', async () => {
      const tag = mockTags[0];
      mockConfirmService.confirm.and.resolveTo(true);
      
      await component.onDelete(tag);
      
      expect(mockConfirmService.confirm).toHaveBeenCalledWith({
        title: 'Delete Tag',
        message: 'Are you sure you want to delete the tag "VIP"? This will remove it from all partners.'
      });
      expect(mockController.deleteTag).toHaveBeenCalledWith('1');
      expect(mockToastService.success).toHaveBeenCalledWith('Tag deleted successfully');
      expect(mockController.loadTags).toHaveBeenCalled();
    });

    it('should not delete tag when cancelled', async () => {
      const tag = mockTags[0];
      mockConfirmService.confirm.and.resolveTo(false);
      
      await component.onDelete(tag);
      
      expect(mockController.deleteTag).not.toHaveBeenCalled();
      expect(mockToastService.success).not.toHaveBeenCalled();
    });

    it('should handle deletion error with message', async () => {
      const tag = mockTags[0];
      mockConfirmService.confirm.and.resolveTo(true);
      mockController.deleteTag.and.rejectWith({ 
        error: { message: 'Cannot delete tag in use' } 
      });
      
      await component.onDelete(tag);
      
      expect(mockToastService.error).toHaveBeenCalledWith('Cannot delete tag in use');
    });

    it('should handle deletion error without message', async () => {
      const tag = mockTags[0];
      mockConfirmService.confirm.and.resolveTo(true);
      mockController.deleteTag.and.rejectWith({});
      
      await component.onDelete(tag);
      
      expect(mockToastService.error).toHaveBeenCalledWith('Failed to delete tag');
    });
  });

  describe('tag styling', () => {
    it('should return correct style for tag with color', () => {
      const tag = mockTags[0];
      const style = component.getTagStyle(tag);
      
      expect(style['background-color']).toBe('#ff0000');
      expect(style['color']).toBe('white');
    });

    it('should use default color when tag has no color', () => {
      const tag: Tag = {
        id: '4',
        tagName: 'No Color'
      };
      const style = component.getTagStyle(tag);
      
      expect(style['background-color']).toBe('#4285f4');
      expect(style['color']).toBe('white');
    });
  });

  describe('loading and error states', () => {
    it('should set loading state during tag load', async () => {
      let resolveLoad: any;
      const loadPromise = new Promise((resolve) => {
        resolveLoad = resolve;
      });
      mockController.loadTags.and.returnValue(loadPromise as any);
      
      const loadPromiseComponent = component.loadTags();
      
      expect(component.loading).toBeTrue();
      
      resolveLoad(mockTags);
      await loadPromiseComponent;
      
      expect(component.loading).toBeFalse();
    });

    it('should reload tags with search term after successful submit', async () => {
      component.searchTerm = 'VIP';
      component.tagForm = {
        tagName: 'New Tag',
        colorHex: '#ff00ff'
      };
      
      await component.onSubmit();
      
      expect(mockController.loadTags).toHaveBeenCalledWith('VIP');
    });
  });

  describe('component state', () => {
    it('should have correct initial state', () => {
      expect(component.tags).toEqual([]);
      expect(component.loading).toBeFalse();
      expect(component.error).toBeNull();
      expect(component.showForm).toBeFalse();
      expect(component.searchTerm).toBe('');
    });

    it('should update tags array when loaded', async () => {
      await component.loadTags();
      
      expect(component.tags).toEqual(mockTags);
      expect(component.loading).toBeFalse();
    });

    it('should set error state on load failure', async () => {
      mockController.loadTags.and.rejectWith(new Error('Network error'));
      
      await component.loadTags();
      
      expect(component.error).toBe('Failed to load tags');
      expect(component.loading).toBeFalse();
    });
  });
});
