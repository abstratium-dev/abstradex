import { Component, inject, OnInit, Signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../core/toast/toast.service';
import { ConfirmDialogService } from '../core/confirm-dialog/confirm-dialog.service';
import { AutofocusDirective } from '../core/autofocus.directive';
import { AddressTileComponent } from './address-tile/address-tile.component';
import { Address, Country, ModelService } from '../model.service';
import { Controller } from '../controller';

@Component({
  selector: 'app-address',
  imports: [CommonModule, FormsModule, AutofocusDirective, AddressTileComponent],
  templateUrl: './address.component.html',
  styleUrl: './address.component.scss'
})
export class AddressComponent implements OnInit {
  private modelService = inject(ModelService);
  private controller = inject(Controller);
  private toastService = inject(ToastService);
  private confirmService = inject(ConfirmDialogService);

  addresses: Signal<Address[]> = this.modelService.addresses$;
  loading: Signal<boolean> = this.modelService.addressesLoading$;
  error: Signal<string | null> = this.modelService.addressesError$;
  countries: Signal<Country[]> = this.modelService.countries$;
  config = this.modelService.config$;

  // Add/Edit Address Form state
  showAddForm = false;
  formSubmitting = false;
  formError: string | null = null;
  editingAddress: Address | null = null;
  newAddress: Partial<Address> = {
    isVerified: false
  };

  // Search state
  searchTerm = '';
  private searchTimeout: any;
  @ViewChild('searchInput') searchInput?: ElementRef<HTMLInputElement>;

  ngOnInit(): void {
    this.controller.loadAddresses();
    this.controller.loadCountries();
    
    // Set default country if not editing
    if (!this.editingAddress && this.config()?.defaultCountry) {
      this.newAddress.countryCode = this.config()!.defaultCountry;
    }
  }

  onSearch(): void {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    const trimmedSearch = this.searchTerm.trim();
    
    if (trimmedSearch.length === 0 || trimmedSearch.length >= 3) {
      this.searchTimeout = setTimeout(() => {
        this.controller.loadAddresses(trimmedSearch || undefined);
        setTimeout(() => {
          this.searchInput?.nativeElement.focus();
        }, 100);
      }, 300);
    }
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.controller.loadAddresses();
  }

  toggleAddForm(): void {
    this.showAddForm = !this.showAddForm;
    if (this.showAddForm) {
      this.editingAddress = null;
      this.resetForm();
    }
  }

  resetForm(): void {
    this.newAddress = {
      isVerified: false,
      countryCode: this.config()?.defaultCountry || 'DE'
    };
    this.formError = null;
  }

  onRetry(): void {
    this.controller.loadAddresses();
  }

  async onSubmitAdd(): Promise<void> {
    if (!this.newAddress.streetLine1?.trim()) {
      this.formError = 'Street address is required';
      return;
    }
    if (!this.newAddress.city?.trim()) {
      this.formError = 'City is required';
      return;
    }
    if (!this.newAddress.countryCode?.trim()) {
      this.formError = 'Country code is required';
      return;
    }

    this.formSubmitting = true;
    this.formError = null;

    try {
      if (this.editingAddress) {
        await this.controller.updateAddress(this.newAddress as Address);
        this.toastService.success('Address updated successfully');
      } else {
        await this.controller.createAddress(this.newAddress as Address);
        this.toastService.success('Address created successfully');
      }
      this.showAddForm = false;
      this.editingAddress = null;
      this.resetForm();
    } catch (err: any) {
      const action = this.editingAddress ? 'update' : 'create';
      this.formError = err.error?.detail || `Failed to ${action} address. Please try again.`;
    } finally {
      this.formSubmitting = false;
    }
  }

  async deleteAddress(address: Address): Promise<void> {
    const confirmed = await this.confirmService.confirm({
      title: 'Delete Address',
      message: `Are you sure you want to delete this address? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      confirmClass: 'btn-danger'
    });

    if (!confirmed) {
      return;
    }

    try {
      await this.controller.deleteAddress(address.id!);
      this.toastService.success('Address deleted successfully');
    } catch (err: any) {
      this.toastService.error('Failed to delete address. Please try again.');
    }
  }

  editAddress(address: Address): void {
    this.editingAddress = address;
    this.showAddForm = true;
    this.newAddress = { ...address };
  }
}
