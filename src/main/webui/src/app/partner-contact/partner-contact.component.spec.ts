import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PartnerContactComponent } from './partner-contact.component';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

describe('PartnerContactComponent', () => {
  let component: PartnerContactComponent;
  let fixture: ComponentFixture<PartnerContactComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PartnerContactComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PartnerContactComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
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
    component.editingContact = { id: '123', isPrimary: false, isVerified: false };
    
    component.resetForm();
    
    expect(component.editingContact).toBeNull();
    expect(component.contactForm.contactValue).toBeUndefined();
    expect(component.contactForm.isPrimary).toBe(false);
  });

  it('should return correct contact type icon', () => {
    expect(component.getContactTypeIcon('EMAIL')).toBe('📧');
    expect(component.getContactTypeIcon('PHONE')).toBe('📞');
    expect(component.getContactTypeIcon('MOBILE')).toBe('📱');
    expect(component.getContactTypeIcon('FAX')).toBe('📠');
    expect(component.getContactTypeIcon('WEBSITE')).toBe('🌐');
    expect(component.getContactTypeIcon('LINKEDIN')).toBe('💼');
    expect(component.getContactTypeIcon('OTHER')).toBe('📋');
  });
});
