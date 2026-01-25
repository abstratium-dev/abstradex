import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Partner, NaturalPerson, LegalEntity } from '../../model.service';
import { PartnerService } from '../../partner.service';

@Component({
  selector: 'partner-tile',
  imports: [CommonModule],
  templateUrl: './partner-tile.component.html',
  styleUrl: './partner-tile.component.scss'
})
export class PartnerTileComponent {
  private partnerService = inject(PartnerService);

  @Input({ required: true }) partner!: Partner;
  @Output() delete = new EventEmitter<Partner>();
  @Output() edit = new EventEmitter<Partner>();
  @Output() manageAddresses = new EventEmitter<Partner>();
  @Output() manageContacts = new EventEmitter<Partner>();
  @Output() manageTags = new EventEmitter<Partner>();
  @Output() viewOverview = new EventEmitter<Partner>();

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

  onManageContacts(event: Event): void {
    event.stopPropagation();
    this.closeContextMenu();
    this.manageContacts.emit(this.partner);
  }

  onManageTags(event: Event): void {
    event.stopPropagation();
    this.closeContextMenu();
    this.manageTags.emit(this.partner);
  }

  onDoubleClick(): void {
    this.closeContextMenu();
    this.viewOverview.emit(this.partner);
  }

  onViewOverview(event: Event): void {
    event.stopPropagation();
    this.closeContextMenu();
    this.viewOverview.emit(this.partner);
  }

  getPartnerIcon(): string {
    return this.partnerService.getPartnerIcon(this.partner)
  }

  getPartnerName(): string {
    return this.partnerService.getPartnerName(this.partner);
  }

  getPartnerAddress(): string | null {
    // Address line is now provided by the backend DTO
    return this.partner.addressLine || null;
  }

  formatDate(date: string | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  }
}
