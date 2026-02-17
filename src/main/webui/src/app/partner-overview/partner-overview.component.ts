import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Controller } from '../controller';
import { LegalEntity, NaturalPerson, Partner, PartnerRelationship, RelationshipType } from '../models';
import { AddressDetail } from '../models/address-detail.model';
import { ContactDetail } from '../models/contact-detail.model';
import { PartnerDiscriminator } from '../models/partner-discriminator';
import { PartnerService } from '../partner.service';

@Component({
  selector: 'app-partner-overview',
  imports: [CommonModule],
  templateUrl: './partner-overview.component.html',
  styleUrl: './partner-overview.component.scss'
})
export class PartnerOverviewComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private controller = inject(Controller);
  private partnerService = inject(PartnerService);

  partner: Partner | null = null;
  addresses: AddressDetail[] = [];
  contacts: ContactDetail[] = [];
  relationships: PartnerRelationship[] = [];
  relationshipTypes: RelationshipType[] = [];
  loading = false;
  error: string | null = null;

  ngOnInit(): void {
    this.loadRelationshipTypes();
    
    // Subscribe to route parameter changes to reload data when navigating between partners
    this.route.paramMap.subscribe(params => {
      const partnerId = params.get('partnerId');
      if (partnerId) {
        this.loadPartnerData(partnerId);
      } else {
        this.error = 'No partner ID provided';
      }
    });
  }

  async loadPartnerData(partnerId: string): Promise<void> {
    this.loading = true;
    this.error = null;
    try {
      // Load partner using controller
      this.partner = await this.controller.getPartnerById(partnerId);
      if (!this.partner) {
        this.error = 'Partner not found';
      } else {
        // Load addresses, contacts, and relationships
        await this.loadAddresses(partnerId);
        await this.loadContacts(partnerId);
        await this.loadRelationships(partnerId);
      }
    } catch (err) {
      this.error = 'Failed to load partner details';
      console.error('Error loading partner:', err);
    } finally {
      this.loading = false;
    }
  }

  async loadAddresses(partnerId: string): Promise<void> {
    try {
      const addresses = await this.controller.loadPartnerAddresses(partnerId);
      this.addresses = this.sortAddresses(addresses || []);
    } catch (err) {
      console.error('Error loading addresses:', err);
    }
  }

  async loadContacts(partnerId: string): Promise<void> {
    try {
      const contacts = await this.controller.loadPartnerContacts(partnerId);
      this.contacts = this.sortContacts(contacts || []);
    } catch (err) {
      console.error('Error loading contacts:', err);
    }
  }

  async loadRelationships(partnerId: string): Promise<void> {
    try {
      this.relationships = await this.controller.loadPartnerRelationships(partnerId);
    } catch (err) {
      console.error('Error loading relationships:', err);
    }
  }

  async loadRelationshipTypes(): Promise<void> {
    try {
      this.relationshipTypes = await this.controller.loadRelationshipTypes();
    } catch (err) {
      console.error('Error loading relationship types:', err);
    }
  }

  sortAddresses(addresses: AddressDetail[]): AddressDetail[] {
    return addresses.sort((a, b) => {
      // Primary first
      if (a.isPrimary && !b.isPrimary) return -1;
      if (!a.isPrimary && b.isPrimary) return 1;
      
      // Then billing
      if (a.addressType === 'BILLING' && b.addressType !== 'BILLING') return -1;
      if (a.addressType !== 'BILLING' && b.addressType === 'BILLING') return 1;
      
      // Then shipping
      if (a.addressType === 'SHIPPING' && b.addressType !== 'SHIPPING') return -1;
      if (a.addressType !== 'SHIPPING' && b.addressType === 'SHIPPING') return 1;
      
      return 0;
    });
  }

  sortContacts(contacts: ContactDetail[]): ContactDetail[] {
    return contacts.sort((a, b) => {
      // Primary first
      if (a.isPrimary && !b.isPrimary) return -1;
      if (!a.isPrimary && b.isPrimary) return 1;
      
      // Then verified
      if (a.isVerified && !b.isVerified) return -1;
      if (!a.isVerified && b.isVerified) return 1;
      
      // Then alphabetical by contact value
      return (a.contactValue || '').localeCompare(b.contactValue || '');
    });
  }

  formatAddress(addressDetail: AddressDetail): string {
    const addr = addressDetail.address;
    if (!addr) return '';
    const parts = [
      addr.streetLine1,
      addr.streetLine2,
      addr.city,
      addr.postalCode,
      addr.countryCode
    ].filter(p => p);
    return parts.join(', ');
  }

  goBack(): void {
    this.router.navigate(['/partners']);
  }

  editPartner(): void {
    if (this.partner) {
      // Navigate back to partners list with state to trigger edit
      this.router.navigate(['/partners'], { 
        state: { editPartnerId: this.partner.id } 
      });
    }
  }

  manageAddresses(): void {
    if (this.partner) {
      this.router.navigate(['/partners', this.partner.id, 'addresses']);
    }
  }

  manageContacts(): void {
    if (this.partner) {
      this.router.navigate(['/partners', this.partner.id, 'contacts']);
    }
  }

  manageTags(): void {
    if (this.partner) {
      this.router.navigate(['/partners', this.partner.id, 'tags']);
    }
  }

  manageRelationships(): void {
    if (this.partner) {
      this.router.navigate(['/partners', this.partner.id, 'relationships']);
    }
  }

  getRelatedPartner(relationship: PartnerRelationship): Partner | undefined {
    if (!this.partner) return undefined;
    if (relationship.fromPartner?.id === this.partner.id) {
      return relationship.toPartner;
    }
    return relationship.fromPartner;
  }

  getRelatedPartnerName(relationship: PartnerRelationship): string {
    const relatedPartner = this.getRelatedPartner(relationship);
    if (!relatedPartner) return 'Unknown Partner';
    return this.partnerService.getPartnerName(relatedPartner);
  }

  getRelationshipDirection(relationship: PartnerRelationship): string {
    if (!this.partner) return '';
    return relationship.fromPartner?.id === this.partner.id ? '→' : '←';
  }

  getRelationshipTypeDescription(relationship: PartnerRelationship): string {
    return relationship.relationshipType?.description || '';
  }

  getRelationshipTypeTooltip(relationship: PartnerRelationship): string {
    const description = this.getRelationshipTypeDescription(relationship);
    return description || relationship.relationshipType?.typeName || '';
  }

  getRelationshipTypeName(relationship: PartnerRelationship): string {
    return relationship.relationshipType?.typeName || 'Unknown Type';
  }

  navigateToRelatedPartner(relationship: PartnerRelationship): void {
    const relatedPartner = this.getRelatedPartner(relationship);
    if (relatedPartner?.id) {
      this.router.navigate(['/partners', relatedPartner.id]);
    }
  }

  navigateToRelationshipType(relationship: PartnerRelationship): void {
    if (relationship.relationshipType?.id) {
      this.router.navigate(['/relationship-types']);
    }
  }

  getPartnerIcon(): string {
    return this.partner ? this.partnerService.getPartnerIcon(this.partner) : '❓';
  }

  getPartnerName(): string {
    return this.partner ? this.partnerService.getPartnerName(this.partner) : '';
  }

  isNaturalPerson(): boolean {
    return this.partner?.partnerType === PartnerDiscriminator.NATURAL_PERSON;
  }

  isLegalEntity(): boolean {
    return this.partner?.partnerType === PartnerDiscriminator.LEGAL_ENTITY;
  }

  asNaturalPerson(): NaturalPerson {
    return this.partner as NaturalPerson;
  }

  asLegalEntity(): LegalEntity {
    return this.partner as LegalEntity;
  }

  formatDate(date: string | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  }

  /**
   * Get the appropriate href for a contact based on its type
   */
  getContactHref(contact: ContactDetail): string {
    const type = contact.contactType?.toUpperCase();
    switch (type) {
      case 'EMAIL':
        return `mailto:${contact.contactValue}`;
      case 'PHONE':
      case 'MOBILE':
      case 'FAX':
        return `tel:${contact.contactValue}`;
      case 'WEBSITE':
      case 'LINKEDIN':
        return contact.contactValue || '';
      default:
        return '';
    }
  }

  /**
   * Check if contact type should be a clickable link
   */
  isContactClickable(contact: ContactDetail): boolean {
    const type = contact.contactType?.toUpperCase();
    return type ? ['EMAIL', 'PHONE', 'MOBILE', 'FAX', 'WEBSITE', 'LINKEDIN'].includes(type) : false;
  }

  getDirection(relationship: PartnerRelationship): 'outgoing' | 'incoming' {
    return relationship.fromPartner?.id === this.partner?.id ? 'outgoing' : 'incoming';
  }

}
