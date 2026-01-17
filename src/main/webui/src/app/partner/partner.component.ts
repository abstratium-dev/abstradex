import { Component, inject, OnInit, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../core/toast/toast.service';
import { ConfirmDialogService } from '../core/confirm-dialog/confirm-dialog.service';
import { Partner, ModelService } from '../model.service';
import { Controller } from '../controller';

@Component({
  selector: 'app-partner',
  imports: [CommonModule, FormsModule],
  templateUrl: './partner.component.html',
  styleUrl: './partner.component.scss'
})
export class PartnerComponent implements OnInit {
  private modelService = inject(ModelService);
  private controller = inject(Controller);
  private toastService = inject(ToastService);
  private confirmService = inject(ConfirmDialogService);

  partners: Signal<Partner[]> = this.modelService.partners$;
  loading: Signal<boolean> = this.modelService.partnersLoading$;
  error: Signal<string | null> = this.modelService.partnersError$;

  // Add Partner Form state
  showAddForm = false;
  formSubmitting = false;
  formError: string | null = null;
  newPartner: Partial<Partner> = {
    partnerNumber: '',
    active: true,
    notes: ''
  };

  // Search state
  searchTerm = '';
  private searchTimeout: any;

  ngOnInit(): void {
    this.controller.loadPartners();
  }

  onSearch(): void {
    // Debounce search to avoid too many API calls
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    
    this.searchTimeout = setTimeout(() => {
      this.controller.loadPartners(this.searchTerm);
    }, 300);
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.controller.loadPartners();
  }

  toggleAddForm(): void {
    this.showAddForm = !this.showAddForm;
    if (this.showAddForm) {
      this.formError = null;
      this.resetForm();
    }
  }

  resetForm(): void {
    this.newPartner = {
      partnerNumber: '',
      active: true,
      notes: ''
    };
  }

  onRetry(): void {
    this.controller.loadPartners();
  }

  async onSubmitAdd(): Promise<void> {
    if (!this.newPartner.partnerNumber?.trim()) {
      this.formError = 'Partner number is required';
      return;
    }

    this.formSubmitting = true;
    this.formError = null;

    try {
      await this.controller.createPartner(this.newPartner as Partner);
      this.toastService.success('Partner created successfully');
      this.showAddForm = false;
      this.resetForm();
    } catch (err: any) {
      this.formError = err.error?.detail || 'Failed to create partner. Please try again.';
    } finally {
      this.formSubmitting = false;
    }
  }

  async deletePartner(partner: Partner): Promise<void> {
    const confirmed = await this.confirmService.confirm({
      title: 'Delete Partner',
      message: `Are you sure you want to delete partner "${partner.partnerNumber}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      confirmClass: 'btn-danger'
    });

    if (!confirmed) {
      return;
    }

    try {
      await this.controller.deletePartner(partner.id);
      this.toastService.success('Partner deleted successfully');
    } catch (err: any) {
      this.toastService.error('Failed to delete partner. Please try again.');
    }
  }

  formatDate(date: string | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  }
}
