import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Partner, NaturalPerson, LegalEntity } from '../../model.service';

@Component({
  selector: 'partner-tile',
  imports: [CommonModule],
  templateUrl: './partner-tile.component.html',
  styleUrl: './partner-tile.component.scss'
})
export class PartnerTileComponent {
  @Input({ required: true }) partner!: Partner;
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
    const le = this.partner as LegalEntity;
    if (le.jurisdiction) {
      return le.jurisdiction;
    }
    return null;
  }

  formatDate(date: string | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  }
}
