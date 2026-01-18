import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Address, Country, ModelService, Partner } from './model.service';
import { AddressDetail } from './models/address-detail.model';

@Injectable({
  providedIn: 'root',
})
export class Controller {

  private modelService = inject(ModelService);
  private http = inject(HttpClient);

  async loadConfig(): Promise<{logLevel: string}> {
    try {
      const config = await firstValueFrom(
        this.http.get<{logLevel: string}>('/public/config')
      );
      this.modelService.setConfig(config);
      return config;
    } catch (error) {
      console.error('Error loading config:', error);
      throw error;
    }
  }

  loadPartners(searchTerm?: string) {
    this.modelService.setPartnersLoading(true);
    this.modelService.setPartnersError(null);
    
    const url = searchTerm && searchTerm.trim() 
      ? `/api/partner?search=${encodeURIComponent(searchTerm)}`
      : '/api/partner';
    
    this.http.get<Partner[]>(url).subscribe({
      next: (partners) => {
        this.modelService.setPartners(partners);
        this.modelService.setPartnersLoading(false);
      },
      error: (err) => {
        console.error('Error loading partners:', err);
        this.modelService.setPartners([]);
        this.modelService.setPartnersError('Failed to load partners');
        this.modelService.setPartnersLoading(false);
      }
    });
  }

  async createPartner(partner: Partner): Promise<Partner> {
    try {
      const response = await firstValueFrom(
        this.http.post<Partner>('/api/partner', partner)
      );
      // Reload partners list after successful creation
      this.loadPartners();
      return response;
    } catch (error) {
      console.error('Error creating partner:', error);
      throw error;
    }
  }

  async updatePartner(partner: Partner): Promise<Partner> {
    try {
      const response = await firstValueFrom(
        this.http.put<Partner>('/api/partner', partner)
      );
      // Reload partners list after successful update
      this.loadPartners();
      return response;
    } catch (error) {
      console.error('Error updating partner:', error);
      throw error;
    }
  }

  async deletePartner(id: string): Promise<void> {
    try {
      await firstValueFrom(
        this.http.delete<void>(`/api/partner/${id}`)
      );
      // Reload partners list after successful deletion
      this.loadPartners();
    } catch (error) {
      console.error('Error deleting partner:', error);
      throw error;
    }
  }

  loadAddresses(searchTerm?: string) {
    this.modelService.setAddressesLoading(true);
    this.modelService.setAddressesError(null);
    
    const url = searchTerm && searchTerm.trim() 
      ? `/api/address?search=${encodeURIComponent(searchTerm)}`
      : '/api/address';
    
    this.http.get<Address[]>(url).subscribe({
      next: (addresses) => {
        this.modelService.setAddresses(addresses);
        this.modelService.setAddressesLoading(false);
      },
      error: (err) => {
        console.error('Error loading addresses:', err);
        this.modelService.setAddresses([]);
        this.modelService.setAddressesError('Failed to load addresses');
        this.modelService.setAddressesLoading(false);
      }
    });
  }

  async createAddress(address: Address): Promise<Address> {
    try {
      const response = await firstValueFrom(
        this.http.post<Address>('/api/address', address)
      );
      // Reload addresses list after successful creation
      this.loadAddresses();
      return response;
    } catch (error) {
      console.error('Error creating address:', error);
      throw error;
    }
  }

  async updateAddress(address: Address): Promise<Address> {
    try {
      const response = await firstValueFrom(
        this.http.put<Address>('/api/address', address)
      );
      // Reload addresses list after successful update
      this.loadAddresses();
      return response;
    } catch (error) {
      console.error('Error updating address:', error);
      throw error;
    }
  }

  async deleteAddress(id: string): Promise<void> {
    try {
      await firstValueFrom(
        this.http.delete<void>(`/api/address/${id}`)
      );
      // Reload addresses list after successful deletion
      this.loadAddresses();
    } catch (error) {
      console.error('Error deleting address:', error);
      throw error;
    }
  }

  async loadCountries(): Promise<void> {
    try {
      const countries = await firstValueFrom(
        this.http.get<Country[]>('/api/address/countries')
      );
      this.modelService.setCountries(countries);
    } catch (error) {
      console.error('Error loading countries:', error);
      throw error;
    }
  }

  // Partner Address Management
  async loadPartnerAddresses(partnerNumber: string): Promise<AddressDetail[]> {
    try {
      return await firstValueFrom(
        this.http.get<AddressDetail[]>(`/api/partner/${partnerNumber}/address`)
      );
    } catch (error) {
      console.error('Error loading partner addresses:', error);
      throw error;
    }
  }

  async addAddressToPartner(partnerNumber: string, addressId: string, addressDetail: AddressDetail): Promise<AddressDetail> {
    try {
      return await firstValueFrom(
        this.http.post<AddressDetail>(
          `/api/partner/${partnerNumber}/address?addressId=${addressId}`,
          addressDetail
        )
      );
    } catch (error) {
      console.error('Error adding address to partner:', error);
      throw error;
    }
  }

  async removeAddressFromPartner(partnerNumber: string, addressDetailId: string): Promise<void> {
    try {
      await firstValueFrom(
        this.http.delete<void>(`/api/partner/${partnerNumber}/address/${addressDetailId}`)
      );
    } catch (error) {
      console.error('Error removing address from partner:', error);
      throw error;
    }
  }
}
