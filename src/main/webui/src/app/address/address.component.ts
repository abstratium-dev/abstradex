import { Component, inject, OnInit, Signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../core/toast/toast.service';
import { ConfirmDialogService } from '../core/confirm-dialog/confirm-dialog.service';
import { AutofocusDirective } from '../core/autofocus.directive';
import { AutocompleteComponent, AutocompleteOption } from '../core/autocomplete/autocomplete.component';
import { AddressTileComponent } from './address-tile/address-tile.component';
import { Address, Country, ModelService } from '../model.service';
import { Controller } from '../controller';

@Component({
  selector: 'app-address',
  imports: [CommonModule, FormsModule, AutofocusDirective, AddressTileComponent, AutocompleteComponent],
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
  loadTime: Signal<number | null> = this.modelService.addressesLoadTime$;
  countries: Signal<Country[]> = this.modelService.countries$;
  config = this.modelService.config$;

  // Add Address Form state
  showAddForm = false;
  formSubmitting = false;
  formError: string | null = null;
  newAddress: Address = {
    isVerified: false
  } as Address;

  // Search state
  searchTerm = '';
  private searchTimeout: any;
  @ViewChild('searchInput') searchInput?: ElementRef<HTMLInputElement>;

  // Country autocomplete
  fetchCountries = async (searchTerm: string): Promise<AutocompleteOption[]> => {
    const countries = this.countries();
    const lowerSearch = searchTerm.toLowerCase();
    const filtered = searchTerm 
      ? countries.filter(c => 
          c.name.toLowerCase().includes(lowerSearch) || 
          c.code.toLowerCase().includes(lowerSearch)
        )
      : countries;
    return filtered.map(c => ({
      value: c.code,
      label: c.name
    }));
  };

  ngOnInit(): void {
    // Don't load addresses automatically - wait for user to search
    this.controller.loadCountries();
    
    // Set default country if not editing
    if (this.config()?.defaultCountry) {
      this.newAddress.countryCode = this.config()!.defaultCountry;
    }
  }

  onSearch(): void {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    const trimmedSearch = this.searchTerm.trim();
    
    // Only search if 3 or more characters
    if (trimmedSearch.length >= 3) {
      this.searchTimeout = setTimeout(() => {
        this.controller.loadAddresses(trimmedSearch);
        setTimeout(() => {
          this.searchInput?.nativeElement.focus();
        }, 100);
      }, 300);
    } else if (trimmedSearch.length === 0) {
      // Clear results when search is empty
      this.controller.clearAddresses();
    }
  }

  clearSearch(): void {
    this.searchTerm = '';
    // Clear addresses list when search is cleared
    this.controller.clearAddresses();
  }

  toggleAddForm(): void {
    this.showAddForm = !this.showAddForm;
    if (this.showAddForm) {
      this.resetForm();
    }
  }

  resetForm(): void {
    this.newAddress = {
      isVerified: false,
      countryCode: this.config()?.defaultCountry || 'DE'
    } as Address;
    this.formError = null;
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
      const createdAddress = await this.controller.createAddress(this.newAddress as Address);
      
      // Build a search query that will uniquely identify this address
      const searchParts: string[] = [];
      if (createdAddress.streetLine1) searchParts.push(createdAddress.streetLine1);
      if (createdAddress.city) searchParts.push(createdAddress.city);
      if (createdAddress.postalCode) searchParts.push(createdAddress.postalCode);
      const searchQuery = searchParts.join(' ');
      
      this.toastService.success('Address created successfully', 7000, {
        label: searchQuery,
        callback: () => {
          // Filter by the address details when clicked
          this.searchTerm = searchQuery;
          this.controller.loadAddresses(searchQuery);
        }
      });
      this.showAddForm = false;
      this.resetForm();
    } catch (err: any) {
      this.formError = err.error?.detail || 'Failed to create address. Please try again.';
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
      //retrigger the search to refresh the list
      if (this.searchTerm && this.searchTerm.trim().length >= 3) {
        this.controller.loadAddresses(this.searchTerm);
      }
    } catch (err: any) {
      this.toastService.error('Failed to delete address. Please try again.');
    }
  }
}
