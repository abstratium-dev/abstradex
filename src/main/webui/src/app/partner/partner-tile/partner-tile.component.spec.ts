import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PartnerTileComponent } from './partner-tile.component';
import { NaturalPerson, LegalEntity } from '../../model.service';
import { PartnerDiscriminator } from '../../models/partner-discriminator';

describe('PartnerTileComponent', () => {
  let component: PartnerTileComponent;
  let fixture: ComponentFixture<PartnerTileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PartnerTileComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(PartnerTileComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display natural person icon and name', () => {
    const naturalPerson: NaturalPerson = {
      id: '1',
      partnerNumber: 'P00000001',
      partnerType: PartnerDiscriminator.NATURAL_PERSON,
      firstName: 'John',
      lastName: 'Doe',
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    component.partner = naturalPerson;
    fixture.detectChanges();

    expect(component.getPartnerIcon()).toBe('👤');
    expect(component.getPartnerName()).toBe('John Doe');
  });

  it('should display legal entity icon and name', () => {
    const legalEntity: LegalEntity = {
      id: '2',
      partnerNumber: 'P00000002',
      partnerType: PartnerDiscriminator.LEGAL_ENTITY,
      legalName: 'Acme Corp',
      tradingName: 'Acme',
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    component.partner = legalEntity;
    fixture.detectChanges();

    expect(component.getPartnerIcon()).toBe('🏢');
    expect(component.getPartnerName()).toBe('Acme');
  });

  it('should emit delete event', () => {
    const naturalPerson: NaturalPerson = {
      id: '1',
      partnerNumber: 'P00000001',
      partnerType: PartnerDiscriminator.NATURAL_PERSON,
      firstName: 'John',
      lastName: 'Doe',
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    component.partner = naturalPerson;

    spyOn(component.delete, 'emit');
    component.onDelete(new Event('click'));

    expect(component.delete.emit).toHaveBeenCalledWith(naturalPerson);
  });

  it('should emit edit event', () => {
    const naturalPerson: NaturalPerson = {
      id: '1',
      partnerNumber: 'P00000001',
      partnerType: PartnerDiscriminator.NATURAL_PERSON,
      firstName: 'John',
      lastName: 'Doe',
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    component.partner = naturalPerson;

    spyOn(component.edit, 'emit');
    component.onEdit(new Event('click'));

    expect(component.edit.emit).toHaveBeenCalledWith(naturalPerson);
  });

  it('should emit manageAddresses event', () => {
    const naturalPerson: NaturalPerson = {
      id: '1',
      partnerNumber: 'P00000001',
      partnerType: PartnerDiscriminator.NATURAL_PERSON,
      firstName: 'John',
      lastName: 'Doe',
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    component.partner = naturalPerson;

    spyOn(component.manageAddresses, 'emit');
    component.onManageAddresses(new Event('click'));

    expect(component.manageAddresses.emit).toHaveBeenCalledWith(naturalPerson);
  });

  it('should toggle context menu', () => {
    expect(component.showContextMenu).toBe(false);
    component.toggleContextMenu(new Event('click'));
    expect(component.showContextMenu).toBe(true);
    component.toggleContextMenu(new Event('click'));
    expect(component.showContextMenu).toBe(false);
  });
});
