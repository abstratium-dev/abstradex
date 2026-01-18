import { Component, inject, OnInit, Signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '../core/toast/toast.service';
import { ConfirmDialogService } from '../core/confirm-dialog/confirm-dialog.service';
import { Controller } from '../controller';
import { ModelService } from '../model.service';
import { Address } from '../models/address.model';
import { AddressDetail } from '../models/address-detail.model';

@Component({
  selector: 'app-partner-address',
  imports: [CommonModule, FormsModule],
  templateUrl: './partner-address.component.html',
  styleUrl: './partner-address.component.scss'
})
export class PartnerAddressComponent implements OnInit {
  private controller = inject(Controller);
  private modelService = inject(ModelService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private location = inject(Location);
  private toastService = inject(ToastService);
  private confirmService = inject(ConfirmDialogService);

  partnerNumber = '';
  partnerAddresses: AddressDetail[] = [];
  availableAddresses: Signal<Address[]> = this.modelService.addresses$;
  loading = false;
  error: string | null = null;

  // Add address form
  showAddForm = false;
  selectedAddressId = '';
  newAddressDetail: Partial<AddressDetail> = {
    isPrimary: false,
    addressType: 'BILLING'
  };

  // Search
  searchTerm = '';
  private searchTimeout: any;

  ngOnInit(): void {
    this.partnerNumber = this.route.snapshot.paramMap.get('partnerNumber') || '';
    if (this.partnerNumber) {
      this.loadPartnerAddresses();
      this.loadAvailableAddresses();
    }
  }

  async loadPartnerAddresses(): Promise<void> {
    this.loading = true;
    this.error = null;
    try {
      this.partnerAddresses = await this.controller.loadPartnerAddresses(this.partnerNumber);
    } catch (err) {
      this.error = 'Failed to load partner addresses';
      this.toastService.error(this.error);
    } finally {
      this.loading = false;
    }
  }

  async loadAvailableAddresses(): Promise<void> {
    try {
      this.controller.loadAddresses(this.searchTerm || undefined);
    } catch (err) {
      console.error('Error loading addresses:', err);
    }
  }

  onSearch(): void {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    const trimmedSearch = this.searchTerm.trim();
    
    if (trimmedSearch.length === 0 || trimmedSearch.length >= 3) {
      this.searchTimeout = setTimeout(() => {
        this.loadAvailableAddresses();
      }, 300);
    }
  }

  toggleAddForm(): void {
    this.showAddForm = !this.showAddForm;
    if (this.showAddForm) {
      this.resetForm();
    }
  }

  resetForm(): void {
    this.selectedAddressId = '';
    this.newAddressDetail = {
      isPrimary: false,
      addressType: 'BILLING'
    };
  }

  async onSubmitAdd(): Promise<void> {
    if (!this.selectedAddressId) {
      this.toastService.error('Please select an address');
      return;
    }

    try {
      await this.controller.addAddressToPartner(
        this.partnerNumber,
        this.selectedAddressId,
        this.newAddressDetail as AddressDetail
      );
      this.toastService.success('Address added to partner');
      this.showAddForm = false;
      this.resetForm();
      await this.loadPartnerAddresses();
    } catch (err) {
      this.toastService.error('Failed to add address to partner');
    }
  }

  async onDelete(addressDetail: AddressDetail): Promise<void> {
    const confirmed = await this.confirmService.confirm({
      title: 'Remove Address',
      message: 'Are you sure you want to remove this address from the partner?'
    });

    if (confirmed && addressDetail.id) {
      try {
        await this.controller.removeAddressFromPartner(this.partnerNumber, addressDetail.id);
        this.toastService.success('Address removed from partner');
        await this.loadPartnerAddresses();
      } catch (err) {
        this.toastService.error('Failed to remove address from partner');
      }
    }
  }

  goToAddressManagement(): void {
    this.router.navigate(['/addresses']);
  }

  goBack(): void {
    this.location.back();
  }

  getAddressDisplay(addressDetail: AddressDetail): string {
    const addr = addressDetail.address;
    if (!addr) return 'Unknown address';
    return `${addr.streetLine1}, ${addr.city}, ${addr.countryCode}`;
  }
}
