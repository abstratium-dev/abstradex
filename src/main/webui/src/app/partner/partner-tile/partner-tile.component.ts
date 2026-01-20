import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Partner, NaturalPerson, LegalEntity } from '../../model.service';
import { AddressDetail } from '../../models/address-detail.model';
import { ModelService } from '../../model.service';

@Component({
  selector: 'partner-tile',
  imports: [CommonModule],
  templateUrl: './partner-tile.component.html',
  styleUrl: './partner-tile.component.scss'
})
export class PartnerTileComponent {
  private modelService = inject(ModelService);

  @Input({ required: true }) partner!: Partner;
  @Input() addressDetails: AddressDetail[] = [];
  @Output() delete = new EventEmitter<Partner>();
  @Output() edit = new EventEmitter<Partner>();
  @Output() manageAddresses = new EventEmitter<Partner>();

  showContextMenu = false;

  toggleContextMenu(event: Event): void {
    event.stopPropagation();
    this.showContextMenu = !this.showContextMenu;
  }

  closeContextMenu(): void {
    this.showContextMenu = false;
  }

  onDelete(event: Event): void {
    event.stopPropagation();
    this.closeContextMenu();
    this.delete.emit(this.partner);
  }

  onEdit(event: Event): void {
    event.stopPropagation();
    this.closeContextMenu();
    this.edit.emit(this.partner);
  }

  onManageAddresses(event: Event): void {
    event.stopPropagation();
    this.closeContextMenu();
    this.manageAddresses.emit(this.partner);
  }

  getPartnerIcon(): string {
    const np = this.partner as NaturalPerson;
    const le = this.partner as LegalEntity;
    
    if (np.firstName || np.lastName) {
      return '👤';
    } else if (le.legalName) {
      return '🏢';
    }
    return '❓';
  }

  getPartnerName(): string {
    const np = this.partner as NaturalPerson;
    const le = this.partner as LegalEntity;
    
    if (np.firstName || np.lastName) {
      const parts = [np.title, np.firstName, np.middleName, np.lastName].filter(p => p);
      return parts.join(' ') || 'Unnamed Person';
    } else if (le.legalName) {
      return le.tradingName || le.legalName || 'Unnamed Entity';
    }
    return 'Unknown Partner';
  }

  getPartnerAddress(): string | null {
    if (!this.addressDetails || this.addressDetails.length === 0) {
      return null;
    }

    // Find primary address first
    let preferredDetail = this.addressDetails.find(ad => ad.isPrimary);
    
    // If no primary, find first billing address
    if (!preferredDetail) {
      preferredDetail = this.addressDetails.find(ad => ad.addressType === 'BILLING');
    }
    
    // If no billing, find first shipping address
    if (!preferredDetail) {
      preferredDetail = this.addressDetails.find(ad => ad.addressType === 'SHIPPING');
    }
    
    // If still nothing, just take the first one
    if (!preferredDetail) {
      preferredDetail = this.addressDetails[0];
    }

    const addr = preferredDetail.address;
    if (!addr) return null;

    const countryName = this.modelService.getCountryName(addr.countryCode || '');
    const parts = [
      addr.city,
      countryName
    ].filter(p => p);
    
    return parts.join(', ') || null;
  }

  formatDate(date: string | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  }
}
