import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { LegalEntity, NaturalPerson, Partner } from '../models';
import { PartnerDiscriminator } from '../models/partner-discriminator';
import { Controller } from '../controller';
import { ModelService } from '../model.service';
import { PartnerService } from '../partner.service';

interface AddressDetail {
  id: string;
  addressType: string;
  isPrimary: boolean;
  address: {
    streetLine1?: string;
    streetLine2?: string;
    city?: string;
    postalCode?: string;
    countryCode?: string;
  };
}

interface ContactDetail {
  id: string;
  contactType: string;
  contactValue: string;
  label?: string;
  isPrimary: boolean;
  isVerified: boolean;
}

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
  private modelService = inject(ModelService);
  private partnerService = inject(PartnerService);
  private http = inject(HttpClient);

  partner: Partner | null = null;
  addresses: AddressDetail[] = [];
  contacts: ContactDetail[] = [];
  loading = false;
  error: string | null = null;

  ngOnInit(): void {
    const partnerId = this.route.snapshot.paramMap.get('partnerId');
    if (partnerId) {
      this.loadPartner(partnerId);
    } else {
      this.error = 'No partner ID provided';
    }
  }

  async loadPartner(partnerId: string): Promise<void> {
    this.loading = true;
    this.error = null;
    try {
      await this.controller.loadPartners();
      const partners = this.modelService.partners$();
      this.partner = partners.find((p: Partner) => p.id === partnerId) || null;
      if (!this.partner) {
        this.error = 'Partner not found';
      } else {
        // Load addresses and contacts
        await this.loadAddresses(partnerId);
        await this.loadContacts(partnerId);
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
      const addresses = await this.http.get<AddressDetail[]>(`/api/partner/${partnerId}/address`).toPromise();
      this.addresses = this.sortAddresses(addresses || []);
    } catch (err) {
      console.error('Error loading addresses:', err);
    }
  }

  async loadContacts(partnerId: string): Promise<void> {
    try {
      const contacts = await this.http.get<ContactDetail[]>(`/api/partner/${partnerId}/contact`).toPromise();
      this.contacts = this.sortContacts(contacts || []);
    } catch (err) {
      console.error('Error loading contacts:', err);
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
}
