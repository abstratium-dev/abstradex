import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PartnerTagComponent } from './partner-tag.component';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

describe('PartnerTagComponent', () => {
  let component: PartnerTagComponent;
  let fixture: ComponentFixture<PartnerTagComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PartnerTagComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PartnerTagComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty forms', () => {
    expect(component.showAddForm).toBe(false);
    expect(component.showCreateForm).toBe(false);
    expect(component.selectedTagId).toBe('');
  });

  it('should toggle add form', () => {
    expect(component.showAddForm).toBe(false);
    component.toggleAddForm();
    expect(component.showAddForm).toBe(true);
    expect(component.showCreateForm).toBe(false);
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
    component.allTags = [
      { id: '1', tagName: 'Tag 1' },
      { id: '2', tagName: 'Tag 2' },
      { id: '3', tagName: 'Tag 3' }
    ];
    component.partnerTags = [
      { id: '1', tagName: 'Tag 1' }
    ];

    const available = component.getAvailableTags();
    expect(available.length).toBe(2);
    expect(available.find(t => t.id === '1')).toBeUndefined();
    expect(available.find(t => t.id === '2')).toBeDefined();
    expect(available.find(t => t.id === '3')).toBeDefined();
  });

  it('should calculate contrast color correctly', () => {
    // Light color should return black text
    expect(component.getContrastColor('#FFFFFF')).toBe('#000000');
    // Dark color should return white text
    expect(component.getContrastColor('#000000')).toBe('#FFFFFF');
  });

  it('should get tag style with color', () => {
    const tag = { id: '1', tagName: 'Test', colorHex: '#FF5733' };
    const style = component.getTagStyle(tag);
    expect(style['background-color']).toBe('#FF5733');
    expect(style['color']).toBeDefined();
  });
});
