import { Component, Input, Output, EventEmitter, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PartnerRelationship, RelationshipType } from '../../models/partner.model';
import { PartnerService } from '../../partner.service';
import { Controller } from '../../controller';

@Component({
  selector: 'relationship-tile',
  imports: [CommonModule],
  templateUrl: './relationship-tile.component.html',
  styleUrl: './relationship-tile.component.scss'
})
export class RelationshipTileComponent implements OnInit {
  private partnerService = inject(PartnerService);
  private router = inject(Router);
  private controller = inject(Controller);
  
  @Input({ required: true }) relationship!: PartnerRelationship;
  @Input({ required: true }) currentPartnerId!: string;
  @Output() delete = new EventEmitter<PartnerRelationship>();

  relationshipTypes: RelationshipType[] = [];
  showContextMenu = false;

  async ngOnInit(): Promise<void> {
    await this.loadRelationshipTypes();
  }

  async loadRelationshipTypes(): Promise<void> {
    try {
      this.relationshipTypes = await this.controller.loadRelationshipTypes();
    } catch (err) {
      console.error('Failed to load relationship types:', err);
    }
  }

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
    this.delete.emit(this.relationship);
  }

  getRelatedPartnerName(): string {
    const relatedPartner = this.getRelatedPartner();
    if (!relatedPartner) return 'Unknown Partner';
    return this.partnerService.getPartnerName(relatedPartner);
  }

  getRelatedPartner() {
    if (this.relationship.fromPartner?.id === this.currentPartnerId) {
      return this.relationship.toPartner;
    }
    return this.relationship.fromPartner;
  }

  getDirection(): 'outgoing' | 'incoming' {
    return this.relationship.fromPartner?.id === this.currentPartnerId ? 'outgoing' : 'incoming';
  }

  getDirectionLabel(): string {
    return this.getDirection() === 'outgoing' ? 'to' : 'from';
  }

  getDirectionArrow(): string {
    return this.getDirection() === 'outgoing' ? '→' : '←';
  }

  formatDate(dateString?: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }

  navigateToPartner(event: Event): void {
    event.stopPropagation();
    const relatedPartner = this.getRelatedPartner();
    if (relatedPartner?.id) {
      this.router.navigate(['/partners', relatedPartner.id]);
    }
  }

  navigateToRelationshipTypes(event: Event): void {
    event.stopPropagation();
    this.router.navigate(['/relationship-types']);
  }

  getRelationshipTypeDescription(): string {
    return this.relationship.relationshipType?.description || '';
  }

  getRelationshipTypeTooltip(): string {
    const description = this.getRelationshipTypeDescription();
    return description || this.relationship.relationshipType?.typeName || '';
  }

  getRelationshipTypeName(): string {
    return this.relationship.relationshipType?.typeName || 'Unknown Type';
  }
}
