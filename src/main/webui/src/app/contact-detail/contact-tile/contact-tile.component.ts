import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContactDetail } from '../../models/contact-detail.model';

@Component({
  selector: 'contact-tile',
  imports: [CommonModule],
  templateUrl: './contact-tile.component.html',
  styleUrl: './contact-tile.component.scss'
})
export class ContactTileComponent {
  @Input({ required: true }) contact!: ContactDetail;
  @Output() delete = new EventEmitter<ContactDetail>();
  @Output() edit = new EventEmitter<ContactDetail>();

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
    this.delete.emit(this.contact);
  }

  onEdit(event: Event): void {
    event.stopPropagation();
    this.closeContextMenu();
    this.edit.emit(this.contact);
  }

  getContactIcon(): string {
    switch (this.contact.contactType) {
      case 'EMAIL':
        return '📧';
      case 'PHONE':
        return '📞';
      case 'MOBILE':
        return '📱';
      case 'FAX':
        return '📠';
      case 'WEBSITE':
        return '🌐';
      case 'LINKEDIN':
        return '💼';
      default:
        return '📋';
    }
  }

  getContactTypeLabel(): string {
    return this.contact.contactType || 'Unknown';
  }

  getContactDisplay(): string {
    const parts = [];
    
    if (this.contact.label) {
      parts.push(this.contact.label);
    }
    
    if (this.contact.contactValue) {
      parts.push(this.contact.contactValue);
    }
    
    return parts.join(': ');
  }
}
