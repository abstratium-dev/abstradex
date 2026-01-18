import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AutocompleteComponent, AutocompleteOption } from './autocomplete.component';
import { FormsModule } from '@angular/forms';

describe('AutocompleteComponent', () => {
  let component: AutocompleteComponent;
  let fixture: ComponentFixture<AutocompleteComponent>;
  let mockFetchOptions: jasmine.Spy<(searchTerm: string) => Promise<AutocompleteOption[]>>;

  const mockOptions: AutocompleteOption[] = [
    { value: '1', label: 'Option 1' },
    { value: '2', label: 'Option 2' },
    { value: '3', label: 'Option 3' }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AutocompleteComponent, FormsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(AutocompleteComponent);
    component = fixture.componentInstance;
    
    mockFetchOptions = jasmine.createSpy('fetchOptions').and.returnValue(Promise.resolve(mockOptions));
    component.fetchOptions = mockFetchOptions;
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Input Handling', () => {
    it('should update search term on input change', () => {
      const input = fixture.nativeElement.querySelector('.autocomplete-input') as HTMLInputElement;
      input.value = 'test';
      input.dispatchEvent(new Event('input'));
      
      expect(component.searchTerm()).toBe('test');
    });

    it('should show dropdown on focus if search term is valid', () => {
      component.searchTerm.set('test');
      const input = fixture.nativeElement.querySelector('.autocomplete-input') as HTMLInputElement;
      input.dispatchEvent(new Event('focus'));
      
      expect(component.showDropdown()).toBe(true);
    });

    it('should hide dropdown on blur after delay', fakeAsync(() => {
      component.showDropdown.set(true);
      const input = fixture.nativeElement.querySelector('.autocomplete-input') as HTMLInputElement;
      input.dispatchEvent(new Event('blur'));
      
      expect(component.showDropdown()).toBe(true);
      tick(200);
      expect(component.showDropdown()).toBe(false);
    }));
  });

  describe('Option Selection', () => {
    it('should select option and emit event', () => {
      spyOn(component.optionSelected, 'emit');
      const option = mockOptions[0];
      
      component.selectOption(option);
      
      expect(component.selectedValue()).toBe(option.value);
      expect(component.selectedLabel()).toBe(option.label);
      expect(component.searchTerm()).toBe(option.label);
      expect(component.showDropdown()).toBe(false);
      expect(component.optionSelected.emit).toHaveBeenCalledWith(option);
    });

    it('should clear selection', () => {
      component.selectedValue.set('1');
      component.selectedLabel.set('Option 1');
      component.searchTerm.set('Option 1');
      
      component.clearSelection();
      
      expect(component.selectedValue()).toBeNull();
      expect(component.selectedLabel()).toBeNull();
      expect(component.searchTerm()).toBe('');
      expect(component.showDropdown()).toBe(false);
    });
  });

  describe('Keyboard Navigation', () => {
    beforeEach(() => {
      component.options.set(mockOptions);
      component.showDropdown.set(true);
    });

    it('should navigate down with ArrowDown', () => {
      const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
      spyOn(event, 'preventDefault');
      
      component.onKeyDown(event);
      
      expect(component.highlightedIndex()).toBe(0);
      expect(event.preventDefault).toHaveBeenCalled();
    });

    it('should navigate up with ArrowUp', () => {
      component.highlightedIndex.set(1);
      const event = new KeyboardEvent('keydown', { key: 'ArrowUp' });
      spyOn(event, 'preventDefault');
      
      component.onKeyDown(event);
      
      expect(component.highlightedIndex()).toBe(0);
      expect(event.preventDefault).toHaveBeenCalled();
    });

    it('should select highlighted option with Enter', () => {
      component.highlightedIndex.set(1);
      spyOn(component, 'selectOption');
      const event = new KeyboardEvent('keydown', { key: 'Enter' });
      spyOn(event, 'preventDefault');
      
      component.onKeyDown(event);
      
      expect(component.selectOption).toHaveBeenCalledWith(mockOptions[1]);
      expect(event.preventDefault).toHaveBeenCalled();
    });

    it('should close dropdown with Escape', () => {
      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      spyOn(event, 'preventDefault');
      
      component.onKeyDown(event);
      
      expect(component.showDropdown()).toBe(false);
      expect(event.preventDefault).toHaveBeenCalled();
    });
  });

  describe('Search Functionality', () => {
    it('should fetch options when search term is valid', fakeAsync(() => {
      component.searchTerm.set('test');
      tick(300); // debounce delay
      
      expect(mockFetchOptions).toHaveBeenCalledWith('test');
    }));

    it('should not fetch options when search term is too short', fakeAsync(() => {
      component.minSearchLength = 3;
      component.searchTerm.set('ab');
      tick(300);
      
      expect(mockFetchOptions).not.toHaveBeenCalled();
      expect(component.options()).toEqual([]);
    }));

    it('should fetch options when search term is empty', fakeAsync(() => {
      component.searchTerm.set('');
      tick(300);
      
      expect(mockFetchOptions).toHaveBeenCalledWith('');
    }));

    it('should set loading state during fetch', fakeAsync(() => {
      let resolvePromise: (value: AutocompleteOption[]) => void;
      const promise = new Promise<AutocompleteOption[]>(resolve => {
        resolvePromise = resolve;
      });
      mockFetchOptions.and.returnValue(promise);
      
      component.searchTerm.set('test');
      tick(300);
      
      expect(component.isLoading()).toBe(true);
      
      resolvePromise!(mockOptions);
      tick();
      
      expect(component.isLoading()).toBe(false);
      expect(component.options()).toEqual(mockOptions);
    }));

    it('should handle fetch errors gracefully', fakeAsync(() => {
      mockFetchOptions.and.returnValue(Promise.reject('Error'));
      spyOn(console, 'error');
      
      component.searchTerm.set('test');
      tick(300);
      tick(); // Allow promise to reject
      
      expect(component.options()).toEqual([]);
      expect(component.isLoading()).toBe(false);
      expect(console.error).toHaveBeenCalled();
    }));
  });

  describe('ControlValueAccessor', () => {
    it('should write value', () => {
      component.writeValue('1');
      
      expect(component.selectedValue()).toBe('1');
    });

    it('should register onChange callback', () => {
      const fn = jasmine.createSpy('onChange');
      component.registerOnChange(fn);
      
      component.selectOption(mockOptions[0]);
      
      expect(fn).toHaveBeenCalledWith('1');
    });

    it('should register onTouched callback', () => {
      const fn = jasmine.createSpy('onTouched');
      component.registerOnTouched(fn);
      
      component.onInputBlur();
      
      expect(fn).toHaveBeenCalled();
    });
  });

  describe('Template Rendering', () => {
    it('should display input with placeholder', () => {
      component.placeholder = 'Search items';
      fixture.detectChanges();
      
      const input = fixture.nativeElement.querySelector('.autocomplete-input') as HTMLInputElement;
      expect(input.placeholder).toBe('Search items');
    });

    it('should show clear button when value is selected', () => {
      component.selectedValue.set('1');
      fixture.detectChanges();
      
      const clearButton = fixture.nativeElement.querySelector('.clear-button');
      expect(clearButton).toBeTruthy();
    });

    it('should not show clear button when no value is selected', () => {
      component.selectedValue.set(null);
      fixture.detectChanges();
      
      const clearButton = fixture.nativeElement.querySelector('.clear-button');
      expect(clearButton).toBeFalsy();
    });

    it('should display options in dropdown', () => {
      component.options.set(mockOptions);
      component.showDropdown.set(true);
      fixture.detectChanges();
      
      const items = fixture.nativeElement.querySelectorAll('.dropdown-item');
      expect(items.length).toBe(3);
      expect(items[0].textContent?.trim()).toBe('Option 1');
    });

    it('should display loading message', () => {
      component.isLoading.set(true);
      component.showDropdown.set(true);
      fixture.detectChanges();
      
      const loading = fixture.nativeElement.querySelector('.loading');
      expect(loading).toBeTruthy();
      expect(loading.textContent?.trim()).toBe(component.searchingText);
    });

    it('should display no results message', () => {
      component.options.set([]);
      component.searchTerm.set('test');
      component.showDropdown.set(true);
      fixture.detectChanges();
      
      const noResults = fixture.nativeElement.querySelector('.no-results');
      expect(noResults).toBeTruthy();
      expect(noResults.textContent?.trim()).toBe(component.noResultsText);
    });
  });
});
