import { CommonModule, Location } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Controller } from '../controller';
import { ConfirmDialogService } from '../core/confirm-dialog/confirm-dialog.service';
import { ToastService } from '../core/toast/toast.service';
import { ModelService } from '../model.service';
import { ContactDetail } from '../models/contact-detail.model';
import { Partner } from '../models/partner.model';
import { PartnerService } from '../partner.service';

@Component({
  selector: 'app-partner-contact',
  imports: [CommonModule, FormsModule],
  templateUrl: './partner-contact.component.html',
  styleUrl: './partner-contact.component.scss'
})
export class PartnerContactComponent implements OnInit {
  private controller = inject(Controller);
  private modelService = inject(ModelService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private location = inject(Location);
  private toastService = inject(ToastService);
  private confirmService = inject(ConfirmDialogService);
  private partnerService = inject(PartnerService);

  partnerId = '';
  partner: Partner | null = null;
  partnerContacts: ContactDetail[] = [];
  loading = false;
  error: string | null = null;

  // Add/Edit contact form
  showForm = false;
  editingContact: ContactDetail | null = null;
  contactForm: ContactDetail = this.getEmptyContact();

  contactTypes = ['EMAIL', 'PHONE', 'MOBILE', 'FAX', 'WEBSITE', 'LINKEDIN', 'OTHER'];

  getPartnerName(): string {
    if (!this.partner) return 'Loading...';
    return this.partnerService.getPartnerName(this.partner);
  }

  getEmptyContact(): ContactDetail {
    return {
      isPrimary: false,
      isVerified: false,
      contactType: 'EMAIL'
    };
  }

  ngOnInit(): void {
    this.partnerId = this.route.snapshot.paramMap.get('partnerId') || '';
    if (this.partnerId) {
      this.loadPartnerData();
      this.loadPartnerContacts();
    }
  }

  async loadPartnerData(): Promise<void> {
    try {
      // Load partner using controller
      this.partner = await this.controller.getPartnerById(this.partnerId);

      if (!this.partner) {
        this.error = 'Partner not found';
        this.toastService.error(this.error);
      }
    } catch (err) {
      console.error('Failed to load partner data:', err);
      this.error = 'Partner not found';
      this.toastService.error(this.error);
    }
  }

  async loadPartnerContacts(): Promise<void> {
    this.loading = true;
    this.error = null;
    try {
      this.partnerContacts = await this.controller.loadPartnerContacts(this.partnerId);
    } catch (err) {
      this.error = 'Failed to load partner contacts';
      this.toastService.error(this.error);
    } finally {
      this.loading = false;
    }
  }

  toggleAddForm(): void {
    this.showForm = !this.showForm;
    if (this.showForm) {
      this.resetForm();
    }
  }

  resetForm(): void {
    this.editingContact = null;
    this.contactForm = this.getEmptyContact();
  }

  async onSubmit(): Promise<void> {
    if (!this.contactForm.contactValue || !this.contactForm.contactType) {
      this.toastService.error('Please fill in all required fields');
      return;
    }

    try {
      if (this.editingContact && this.editingContact.id) {
        // Update existing contact
        await this.controller.updateContact(this.partnerId, this.editingContact.id, this.contactForm);
        this.toastService.success('Contact updated successfully');
      } else {
        // Create new contact
        await this.controller.addContactToPartner(this.partnerId, this.contactForm);
        this.toastService.success('Contact added successfully');
      }
      this.showForm = false;
      this.resetForm();
      await this.loadPartnerContacts();
    } catch (err) {
      this.toastService.error(this.editingContact ? 'Failed to update contact' : 'Failed to add contact');
    }
  }

  onEdit(contact: ContactDetail): void {
    this.editingContact = contact;
    this.contactForm = { ...contact };
    this.showForm = true;
  }

  async onDelete(contact: ContactDetail): Promise<void> {
    const confirmed = await this.confirmService.confirm({
      title: 'Remove Contact',
      message: 'Are you sure you want to remove this contact from the partner?'
    });

    if (confirmed && contact.id) {
      try {
        await this.controller.removeContactFromPartner(this.partnerId, contact.id);
        this.toastService.success('Contact removed successfully');
        await this.loadPartnerContacts();
      } catch (err) {
        this.toastService.error('Failed to remove contact');
      }
    }
  }

  goBack(): void {
    this.location.back();
  }

  getPartnerNumberAndName(): string {
    if (this.partner == null) return "";
    return this.partner.partnerNumber + " " + this.partnerService.getPartnerName(this.partner);
  }

  getContactTypeIcon(type: string): string {
    switch (type?.toUpperCase()) {
      case 'EMAIL': return '📧';
      case 'PHONE': return '📞';
      case 'MOBILE': return '📱';
      case 'FAX': return '📠';
      case 'WEBSITE': return '🌐';
      case 'LINKEDIN': return '💼';
      case 'OTHER': return '📋';
      default: return '📋';
    }
  }

  getInputType(): string {
    const type = this.contactForm.contactType?.toUpperCase();
    switch (type) {
      case 'EMAIL':
        return 'email';
      case 'PHONE':
      case 'MOBILE':
      case 'FAX':
        return 'tel';
      case 'WEBSITE':
      case 'LINKEDIN':
        return 'url';
      default:
        return 'text';
    }
  }

  getValidationPattern(): string {
    const type = this.contactForm.contactType?.toUpperCase();
    switch (type) {
      case 'EMAIL':
        return '[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}';
      case 'PHONE':
      case 'MOBILE':
      case 'FAX':
        return '[0-9+\\-\\s()]+';
      case 'WEBSITE':
      case 'LINKEDIN':
        return 'https?://.*';
      default:
        return '';
    }
  }

  getPlaceholder(): string {
    switch (this.contactForm.contactType?.toUpperCase()) {
      case 'EMAIL':
        return 'e.g., john@example.com';
      case 'PHONE':
      case 'MOBILE':
        return 'e.g., +1-555-0123';
      case 'FAX':
        return 'e.g., +1-555-0124';
      case 'WEBSITE':
        return 'e.g., https://example.com';
      case 'LINKEDIN':
        return 'e.g., https://linkedin.com/in/username';
      default:
        return 'Enter contact value';
    }
  }

  /**
   * Get the appropriate href for a contact based on its type
   */
  getContactHref(contact: ContactDetail): string {
    const type = contact.contactType?.toUpperCase();
    switch (type) {
      case 'EMAIL':
        return `mailto:${contact.contactValue || ''}`;
      case 'PHONE':
      case 'MOBILE':
      case 'FAX':
        return `tel:${contact.contactValue || ''}`;
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
    const type = contact.contactType?.toUpperCase() || '';
    return ['EMAIL', 'PHONE', 'MOBILE', 'FAX', 'WEBSITE', 'LINKEDIN'].includes(type);
  }
}
