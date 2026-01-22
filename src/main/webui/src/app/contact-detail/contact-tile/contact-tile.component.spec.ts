import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ContactTileComponent } from './contact-tile.component';
import { ContactDetail } from '../../models/contact-detail.model';

describe('ContactTileComponent', () => {
  let component: ContactTileComponent;
  let fixture: ComponentFixture<ContactTileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactTileComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ContactTileComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    component.contact = {
      id: '1',
      contactType: 'EMAIL',
      contactValue: 'test@example.com',
      isPrimary: false,
      isVerified: false
    };
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should display email icon for EMAIL type', () => {
    component.contact = {
      contactType: 'EMAIL',
      contactValue: 'test@example.com',
      isPrimary: false,
      isVerified: false
    };
    expect(component.getContactIcon()).toBe('📧');
  });

  it('should display phone icon for PHONE type', () => {
    component.contact = {
      contactType: 'PHONE',
      contactValue: '+1234567890',
      isPrimary: false,
      isVerified: false
    };
    expect(component.getContactIcon()).toBe('📞');
  });

  it('should display mobile icon for MOBILE type', () => {
    component.contact = {
      contactType: 'MOBILE',
      contactValue: '+1234567890',
      isPrimary: false,
      isVerified: false
    };
    expect(component.getContactIcon()).toBe('📱');
  });

  it('should format contact display with label and value', () => {
    component.contact = {
      contactType: 'EMAIL',
      contactValue: 'test@example.com',
      label: 'Work',
      isPrimary: false,
      isVerified: false
    };
    expect(component.getContactDisplay()).toBe('Work: test@example.com');
  });

  it('should format contact display with value only', () => {
    component.contact = {
      contactType: 'EMAIL',
      contactValue: 'test@example.com',
      isPrimary: false,
      isVerified: false
    };
    expect(component.getContactDisplay()).toBe('test@example.com');
  });

  it('should emit delete event', () => {
    const contact: ContactDetail = {
      id: '1',
      contactType: 'EMAIL',
      contactValue: 'test@example.com',
      isPrimary: false,
      isVerified: false
    };
    component.contact = contact;

    spyOn(component.delete, 'emit');
    
    const event = new Event('click');
    component.onDelete(event);

    expect(component.delete.emit).toHaveBeenCalledWith(contact);
  });

  it('should emit edit event', () => {
    const contact: ContactDetail = {
      id: '1',
      contactType: 'EMAIL',
      contactValue: 'test@example.com',
      isPrimary: false,
      isVerified: false
    };
    component.contact = contact;

    spyOn(component.edit, 'emit');
    
    const event = new Event('click');
    component.onEdit(event);

    expect(component.edit.emit).toHaveBeenCalledWith(contact);
  });

  it('should toggle context menu', () => {
    component.contact = {
      contactType: 'EMAIL',
      contactValue: 'test@example.com',
      isPrimary: false,
      isVerified: false
    };
    
    expect(component.showContextMenu).toBe(false);
    
    const event = new Event('click');
    component.toggleContextMenu(event);
    expect(component.showContextMenu).toBe(true);
    
    component.toggleContextMenu(event);
    expect(component.showContextMenu).toBe(false);
  });

  it('should close context menu', () => {
    component.contact = {
      contactType: 'EMAIL',
      contactValue: 'test@example.com',
      isPrimary: false,
      isVerified: false
    };
    
    component.showContextMenu = true;
    component.closeContextMenu();
    expect(component.showContextMenu).toBe(false);
  });
});
