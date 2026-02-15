import { Component, inject, OnInit, Signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '../core/toast/toast.service';
import { ConfirmDialogService } from '../core/confirm-dialog/confirm-dialog.service';
import { AutocompleteComponent, AutocompleteOption } from '../core/autocomplete/autocomplete.component';
import { Controller } from '../controller';
import { ModelService } from '../model.service';
import { Address } from '../models/address.model';
import { AddressDetail } from '../models/address-detail.model';
import { Partner } from '../models/partner.model';
import { PartnerService } from '../partner.service';

@Component({
  selector: 'app-partner-address',
  imports: [CommonModule, FormsModule, AutocompleteComponent],
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
  private partnerService = inject(PartnerService);

  partnerId = '';
  partner: Partner | null = null;
  partnerAddresses: AddressDetail[] = [];
  loading = false;
  error: string | null = null;

  // Add address form
  showAddForm = false;
  selectedAddressId = '';
  newAddressDetail: AddressDetail = {
    isPrimary: false,
    addressType: 'BILLING'
  };

  // Context menu state
  activeContextMenuIndex: number | null = null;

  getPartnerName(): string {
    if (!this.partner) return 'Loading...';
    return this.partnerService.getPartnerName(this.partner);
  }

  // Autocomplete fetch function
  fetchAddresses = async (searchTerm: string): Promise<AutocompleteOption[]> => {
    await this.controller.loadAddresses(searchTerm);
    const addresses = this.modelService.addresses$();
    return addresses.map(addr => ({
      value: addr.id || '',
      label: this.formatAddressLabel(addr)
    }));
  };

  ngOnInit(): void {
    this.partnerId = this.route.snapshot.paramMap.get('partnerId') || '';
    if (this.partnerId) {
      this.loadPartnerData();
      this.loadPartnerAddresses();
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

  async loadPartnerAddresses(): Promise<void> {
    this.loading = true;
    this.error = null;
    try {
      this.partnerAddresses = await this.controller.loadPartnerAddresses(this.partnerId);
    } catch (err) {
      this.error = 'Failed to load partner addresses';
      this.toastService.error(this.error);
    } finally {
      this.loading = false;
    }
  }

  formatAddressLabel(addr: Address): string {
    const countryName = this.modelService.getCountryName(addr.countryCode || '');
    const parts = [
      addr.streetLine1,
      addr.city,
      countryName
    ].filter(p => p);
    return parts.join(', ');
  }

  onAddressSelected(option: AutocompleteOption): void {
    this.selectedAddressId = option.value;
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
    } as AddressDetail;
  }

  async onSubmitAdd(): Promise<void> {
    if (!this.selectedAddressId) {
      this.toastService.error('Please select an address');
      return;
    }

    try {
      await this.controller.addAddressToPartner(
        this.partnerId,
        this.selectedAddressId,
        this.newAddressDetail
      );
      this.toastService.success('Address added to partner');
      this.showAddForm = false;
      this.resetForm();
      await this.loadPartnerAddresses();
    } catch (err) {
      this.toastService.error('Failed to add address to partner');
    }
  }

  toggleContextMenu(event: Event, index: number): void {
    event.stopPropagation();
    this.activeContextMenuIndex = this.activeContextMenuIndex === index ? null : index;
  }

  closeContextMenu(index: number): void {
    if (this.activeContextMenuIndex === index) {
      this.activeContextMenuIndex = null;
    }
  }

  async onDelete(addressDetail: AddressDetail, event?: Event): Promise<void> {
    if (event) {
      event.stopPropagation();
    }
    this.activeContextMenuIndex = null;
    const confirmed = await this.confirmService.confirm({
      title: 'Remove Address',
      message: 'Are you sure you want to remove this address from the partner?'
    });

    if (confirmed && addressDetail.id) {
      try {
        await this.controller.removeAddressFromPartner(this.partnerId, addressDetail.id);
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
    const countryName = this.modelService.getCountryName(addr.countryCode || '');
    const parts = [
      addr.streetLine1,
      addr.city,
      countryName
    ].filter(p => p);
    return parts.join(', ');
  }

  getPartnerNumberAndName() {
    if (this.partner == null) return "";
    return this.partner.partnerNumber + " " + this.partnerService.getPartnerName(this.partner)
  }

}
