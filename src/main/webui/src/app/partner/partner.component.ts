import { Component, inject, OnInit, Signal, ViewChild, ElementRef, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastService } from '../core/toast/toast.service';
import { ConfirmDialogService } from '../core/confirm-dialog/confirm-dialog.service';
import { AutofocusDirective } from '../core/autofocus.directive';
import { PartnerTileComponent } from './partner-tile/partner-tile.component';
import { Partner, NaturalPerson, LegalEntity, ModelService } from '../model.service';
import { Controller } from '../controller';
import { PartnerService } from '../partner.service';
import { PartnerDiscriminator } from '../models/partner-discriminator';

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
  private partnerService = inject(PartnerService);

  // Sorted partners alphabetically by name
  partners: Signal<Partner[]> = computed(() => {
    const unsorted = this.modelService.partners$();
    return [...unsorted].sort((a, b) => {
      const nameA = this.partnerService.getPartnerName(a).toLowerCase();
      const nameB = this.partnerService.getPartnerName(b).toLowerCase();
      return nameA.localeCompare(nameB);
    });
  });
  loading: Signal<boolean> = this.modelService.partnersLoading$;
  error: Signal<string | null> = this.modelService.partnersError$;
  loadTime: Signal<number | null> = this.modelService.partnersLoadTime$;

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

  async ngOnInit(): Promise<void> {
    // Check if we're navigating from partner overview to edit
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state || history.state;
    if (state?.editPartnerId) {
      // Load the partner and open edit form
      const partnerId = state.editPartnerId;
      // Fetch the specific partner by ID
      const partner = await this.controller.getPartnerById(partnerId);
      if (partner) {
        this.editPartner(partner);
      }
    } else {
      // Restore last search term if available (e.g., when navigating back from partner overview)
      const lastSearchTerm = this.modelService.lastPartnerSearchTerm$();
      if (lastSearchTerm) {
        this.searchTerm = lastSearchTerm;
        // Partners are already loaded in the model, no need to search again
      }
    }
  }

  onSearch(): void {
    // Clear any existing timeout
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    const trimmedSearch = this.searchTerm.trim();
    
    // Only search if 3 or more characters
    if (trimmedSearch.length >= 3) {
      // Debounce search to avoid excessive API calls
      this.searchTimeout = setTimeout(() => {
        this.controller.loadPartners(trimmedSearch);
        // Restore focus after search completes
        setTimeout(() => {
          this.searchInput?.nativeElement.focus();
        }, 100);
      }, 300);
    } else if (trimmedSearch.length === 0) {
      // Clear results when search is empty
      this.controller.clearPartners();
    }
  }

  clearSearch(): void {
    this.searchTerm = '';
    // Clear partners list when search is cleared
    this.controller.clearPartners();
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

  async onSubmitAdd(): Promise<void> {
    if (!this.partnerType) {
      this.formError = 'Please select partner type';
      return;
    }

    // Validate based on partner type
    let partnerData: Partial<Partner>;
    if (this.partnerType === 'natural') {
      const naturalPerson: NaturalPerson = {
        ...this.newNaturalPerson as NaturalPerson,
        partnerType: PartnerDiscriminator.NATURAL_PERSON,
        id: this.editingPartner?.id || '',
        partnerNumber: this.editingPartner?.partnerNumber || '',
        active: this.newNaturalPerson.active ?? true
      };
      partnerData = naturalPerson;
    } else {
      const legalEntity: LegalEntity = {
        ...this.newLegalEntity as LegalEntity,
        partnerType: PartnerDiscriminator.LEGAL_ENTITY,
        id: this.editingPartner?.id || '',
        partnerNumber: this.editingPartner?.partnerNumber || '',
        active: this.newLegalEntity.active ?? true
      };
      partnerData = legalEntity;
    }

    this.formSubmitting = true;
    this.formError = null;

    try {
      if (this.editingPartner) {
        // Update existing partner
        const updatedPartner = await this.controller.updatePartner(partnerData as Partner);
        this.toastService.success('Partner updated successfully', 7000, {
          label: updatedPartner.partnerNumber,
          callback: () => {
            // Filter by the partner number when clicked
            this.searchTerm = updatedPartner.partnerNumber;
            this.controller.loadPartners(updatedPartner.partnerNumber);
          }
        });
        // Retrigger search to refresh the list
        if (this.searchTerm && this.searchTerm.trim().length >= 3) {
          this.controller.loadPartners(this.searchTerm);
        }
      } else {
        // Create new partner
        const createdPartner = await this.controller.createPartner(partnerData as Partner);
        // Set search term to the new partner number and search
        this.toastService.success('Partner created successfully', 7000, {
          label: createdPartner.partnerNumber,
          callback: () => {
            // Filter by the partner number when clicked
            this.searchTerm = createdPartner.partnerNumber;
            this.controller.loadPartners(createdPartner.partnerNumber);
          }
        });
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
      //retrigger the search to refresh the list
      if (this.searchTerm && this.searchTerm.trim().length >= 3) {
        this.controller.loadPartners(this.searchTerm);
      }
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

  viewOverview(partner: Partner): void {
    this.router.navigate(['/partners', partner.id]);
  }

  manageAddresses(partner: Partner): void {
    this.router.navigate(['/partners', partner.id, 'addresses']);
  }

  manageContacts(partner: Partner): void {
    this.router.navigate(['/partners', partner.id, 'contacts']);
  }

  manageTags(partner: Partner): void {
    this.router.navigate(['/partners', partner.id, 'tags']);
  }
}
