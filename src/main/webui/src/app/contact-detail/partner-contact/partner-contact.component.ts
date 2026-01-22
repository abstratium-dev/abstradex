import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContactDetail } from '../../models/contact-detail.model';
import { Controller } from '../../controller';
import { ToastService } from '../../core/toast/toast.service';
import { ConfirmDialogService } from '../../core/confirm-dialog/confirm-dialog.service';
import { ContactTileComponent } from '../contact-tile/contact-tile.component';

@Component({
  selector: 'partner-contact',
  imports: [CommonModule, FormsModule, ContactTileComponent],
  templateUrl: './partner-contact.component.html',
  styleUrl: './partner-contact.component.scss'
})
export class PartnerContactComponent implements OnInit {
  private controller = inject(Controller);
  private toastService = inject(ToastService);
  private confirmService = inject(ConfirmDialogService);

  @Input({ required: true }) partnerId!: string;

  contacts: ContactDetail[] = [];
  loading = false;
  error: string | null = null;

  // Form state
  showAddForm = false;
  editingContact: ContactDetail | null = null;
  formSubmitting = false;
  formError: string | null = null;
  
  contactForm: ContactDetail = {
    isPrimary: false,
    isVerified: false
  } as ContactDetail;

  contactTypes = ['EMAIL', 'PHONE', 'MOBILE', 'FAX', 'WEBSITE', 'LINKEDIN'];

  async ngOnInit(): Promise<void> {
    await this.loadContacts();
  }

  async loadContacts(): Promise<void> {
    this.loading = true;
    this.error = null;
    try {
      this.contacts = await this.controller.loadPartnerContacts(this.partnerId);
    } catch (err: any) {
      this.error = 'Failed to load contacts';
      console.error('Error loading contacts:', err);
    } finally {
      this.loading = false;
    }
  }

  toggleAddForm(): void {
    this.showAddForm = !this.showAddForm;
    if (this.showAddForm) {
      this.resetForm();
    }
  }

  resetForm(): void {
    this.contactForm = {
      isPrimary: false,
      isVerified: false
    } as ContactDetail;
    this.editingContact = null;
    this.formError = null;
  }

  editContact(contact: ContactDetail): void {
    this.editingContact = contact;
    this.contactForm = { ...contact };
    this.showAddForm = true;
  }

  async onSubmit(): Promise<void> {
    if (!this.contactForm.contactType?.trim()) {
      this.formError = 'Contact type is required';
      return;
    }
    if (!this.contactForm.contactValue?.trim()) {
      this.formError = 'Contact value is required';
      return;
    }

    this.formSubmitting = true;
    this.formError = null;

    try {
      if (this.editingContact?.id) {
        await this.controller.updateContact(
          this.partnerId,
          this.editingContact.id,
          this.contactForm
        );
        this.toastService.success('Contact updated successfully');
      } else {
        await this.controller.addContactToPartner(this.partnerId, this.contactForm);
        this.toastService.success('Contact added successfully');
      }
      
      this.showAddForm = false;
      this.resetForm();
      await this.loadContacts();
    } catch (err: any) {
      this.formError = err.error?.detail || 'Failed to save contact. Please try again.';
    } finally {
      this.formSubmitting = false;
    }
  }

  async deleteContact(contact: ContactDetail): Promise<void> {
    const confirmed = await this.confirmService.confirm({
      title: 'Delete Contact',
      message: `Are you sure you want to delete this contact? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      confirmClass: 'btn-danger'
    });

    if (!confirmed) {
      return;
    }

    try {
      await this.controller.removeContactFromPartner(this.partnerId, contact.id!);
      this.toastService.success('Contact deleted successfully');
      await this.loadContacts();
    } catch (err: any) {
      this.toastService.error('Failed to delete contact. Please try again.');
    }
  }

  cancelEdit(): void {
    this.showAddForm = false;
    this.resetForm();
  }
}
