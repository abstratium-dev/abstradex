import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Address, ModelService } from '../../model.service';

@Component({
  selector: 'address-tile',
  imports: [CommonModule],
  templateUrl: './address-tile.component.html',
  styleUrl: './address-tile.component.scss'
})
export class AddressTileComponent {
  private modelService = inject(ModelService);
  
  @Input({ required: true }) address!: Address;
  @Output() delete = new EventEmitter<Address>();
  @Output() edit = new EventEmitter<Address>();

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
    this.delete.emit(this.address);
  }

  onEdit(event: Event): void {
    event.stopPropagation();
    this.closeContextMenu();
    this.edit.emit(this.address);
  }

  getAddressDisplay(): string {
    const parts = [
      this.address.streetLine1,
      this.address.streetLine2,
      this.address.city,
      this.address.stateProvince,
      this.address.postalCode
    ].filter(p => p);
    return parts.join(', ');
  }

  getCountryName(): string {
    return this.modelService.getCountryName(this.address.countryCode || '');
  }
}
