import { Component, inject, OnInit, Signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastService } from '../core/toast/toast.service';
import { ConfirmDialogService } from '../core/confirm-dialog/confirm-dialog.service';
import { AutofocusDirective } from '../core/autofocus.directive';
import { PartnerTileComponent } from './partner-tile/partner-tile.component';
import { Partner, NaturalPerson, LegalEntity, ModelService } from '../model.service';
import { Controller } from '../controller';
import { AddressDetail } from '../models/address-detail.model';

@Component({
  selector: 'app-partner',
  imports: [CommonModule, FormsModule, AutofocusDirective, PartnerTileComponent],
  templateUrl: './partner.component.html',
  styleUrl: './partner.component.scss'
})
export class PartnerComponent implements OnInit {
  private modelService = inject(ModelService);
  private controller = inject(Controller);
  private router = inject(Router);
  private toastService = inject(ToastService);
  private confirmService = inject(ConfirmDialogService);

  partners: Signal<Partner[]> = this.modelService.partners$;
  loading: Signal<boolean> = this.modelService.partnersLoading$;
  error: Signal<string | null> = this.modelService.partnersError$;

  // Add/Edit Partner Form state
  showAddForm = false;
  formSubmitting = false;
  formError: string | null = null;
  partnerType: 'natural' | 'legal' | null = null;
  editingPartner: Partner | null = null;
  newNaturalPerson: Partial<NaturalPerson> = {
    active: true,
    notes: ''
  };
  newLegalEntity: Partial<LegalEntity> = {
    active: true,
    notes: ''
  };

  // Search state
  searchTerm = '';
  private searchTimeout: any;
  @ViewChild('searchInput') searchInput?: ElementRef<HTMLInputElement>;

  // Partner addresses map
  partnerAddresses: Map<string, AddressDetail[]> = new Map();

  ngOnInit(): void {
    this.controller.loadPartners();
    this.loadAllPartnerAddresses();
  }

  async loadAllPartnerAddresses(): Promise<void> {
    const partners = this.partners();
    for (const partner of partners) {
      try {
        const addresses = await this.controller.loadPartnerAddresses(partner.id);
        this.partnerAddresses.set(partner.id, addresses);
      } catch (err) {
        console.error(`Failed to load addresses for partner ${partner.id}:`, err);
      }
    }
  }

  getPartnerAddresses(partnerId: string): AddressDetail[] {
    return this.partnerAddresses.get(partnerId) || [];
  }

  onSearch(): void {
    // Clear any existing timeout
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    const trimmedSearch = this.searchTerm.trim();
    
    // Only search if 3 or more characters, or if empty (to show all)
    if (trimmedSearch.length === 0 || trimmedSearch.length >= 3) {
      // Debounce search to avoid excessive API calls
      this.searchTimeout = setTimeout(() => {
        this.controller.loadPartners(trimmedSearch || undefined);
        // Restore focus after search completes
        setTimeout(() => {
          this.searchInput?.nativeElement.focus();
        }, 100);
      }, 300);
    }
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.controller.loadPartners();
  }

  toggleAddForm(): void {
    this.showAddForm = !this.showAddForm;
    if (this.showAddForm) {
      this.editingPartner = null;
      this.resetForm();
    }
  }

  resetForm(): void {
    this.partnerType = null;
    this.newNaturalPerson = {
      active: true,
      notes: ''
    };
    this.newLegalEntity = {
      active: true,
      notes: ''
    };
    this.formError = null;
  }

  selectPartnerType(type: 'natural' | 'legal'): void {
    this.partnerType = type;
    this.newNaturalPerson = {
      active: true,
      notes: ''
    };
    this.newLegalEntity = {
      active: true,
      notes: ''
    };
  }

  onRetry(): void {
    this.controller.loadPartners();
  }

  async onSubmitAdd(): Promise<void> {
    if (!this.partnerType) {
      this.formError = 'Please select partner type';
      return;
    }

    // Validate based on partner type
    let partnerData: Partial<Partner>;
    if (this.partnerType === 'natural') {
      if (!this.newNaturalPerson.firstName?.trim() || !this.newNaturalPerson.lastName?.trim()) {
        this.formError = 'First name and last name are required';
        return;
      }
      partnerData = this.newNaturalPerson;
    } else {
      if (!this.newLegalEntity.legalName?.trim()) {
        this.formError = 'Legal name is required';
        return;
      }
      partnerData = this.newLegalEntity;
    }

    this.formSubmitting = true;
    this.formError = null;

    try {
      if (this.editingPartner) {
        // Update existing partner
        await this.controller.updatePartner(partnerData as Partner);
        this.toastService.success('Partner updated successfully');
      } else {
        // Create new partner
        await this.controller.createPartner(partnerData as Partner);
        this.toastService.success('Partner created successfully');
      }
      this.showAddForm = false;
      this.editingPartner = null;
      this.resetForm();
    } catch (err: any) {
      const action = this.editingPartner ? 'update' : 'create';
      this.formError = err.error?.detail || `Failed to ${action} partner. Please try again.`;
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

  editPartner(partner: Partner): void {
    this.editingPartner = partner;
    this.showAddForm = true;
    
    // Determine partner type and populate form
    const np = partner as NaturalPerson;
    const le = partner as LegalEntity;
    
    if (np.firstName || np.lastName) {
      this.partnerType = 'natural';
      this.newNaturalPerson = {
        id: partner.id,
        firstName: np.firstName,
        lastName: np.lastName,
        middleName: np.middleName,
        title: np.title,
        dateOfBirth: np.dateOfBirth,
        taxId: np.taxId,
        preferredLanguage: np.preferredLanguage,
        active: partner.active,
        notes: partner.notes,
        partnerType: partner.partnerType
      };
    } else if (le.legalName) {
      this.partnerType = 'legal';
      this.newLegalEntity = {
        id: partner.id,
        legalName: le.legalName,
        tradingName: le.tradingName,
        registrationNumber: le.registrationNumber,
        taxId: le.taxId,
        legalForm: le.legalForm,
        incorporationDate: le.incorporationDate,
        jurisdiction: le.jurisdiction,
        active: partner.active,
        notes: partner.notes,
        partnerType: partner.partnerType
      };
    }
  }

  manageAddresses(partner: Partner): void {
    this.router.navigate(['/partners', partner.id, 'addresses']);
  }
}
