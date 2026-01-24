import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Address, Country, ModelService, Partner } from './model.service';
import { AddressDetail } from './models/address-detail.model';
import { ContactDetail } from './models/contact-detail.model';
import { Tag } from './models/partner.model';
import { PartnerTag } from './models/partner-tag.model';

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
  async loadPartnerAddresses(partnerId: string): Promise<AddressDetail[]> {
    try {
      return await firstValueFrom(
        this.http.get<AddressDetail[]>(`/api/partner/${partnerId}/address`)
      );
    } catch (error) {
      console.error('Failed to load partner addresses:', error);
      throw error;
    }
  }

  async addAddressToPartner(partnerId: string, addressId: string, addressDetail: AddressDetail): Promise<AddressDetail> {
    try {
      return await firstValueFrom(
        this.http.post<AddressDetail>(
          `/api/partner/${partnerId}/address?addressId=${addressId}`,
          addressDetail
        )
      );
    } catch (error) {
      console.error('Failed to add address to partner:', error);
      throw error;
    }
  }

  async removeAddressFromPartner(partnerId: string, addressDetailId: string): Promise<void> {
    try {
      await firstValueFrom(
        this.http.delete<void>(`/api/partner/${partnerId}/address/${addressDetailId}`)
      );
    } catch (error) {
      console.error('Failed to remove address from partner:', error);
      throw error;
    }
  }

  // Partner Contact Management
  async loadPartnerContacts(partnerId: string): Promise<ContactDetail[]> {
    try {
      return await firstValueFrom(
        this.http.get<ContactDetail[]>(`/api/partner/${partnerId}/contact`)
      );
    } catch (error) {
      console.error('Failed to load partner contacts:', error);
      throw error;
    }
  }

  async addContactToPartner(partnerId: string, contactDetail: ContactDetail): Promise<ContactDetail> {
    try {
      return await firstValueFrom(
        this.http.post<ContactDetail>(
          `/api/partner/${partnerId}/contact`,
          contactDetail
        )
      );
    } catch (error) {
      console.error('Failed to add contact to partner:', error);
      throw error;
    }
  }

  async updateContact(partnerId: string, contactId: string, contactDetail: ContactDetail): Promise<ContactDetail> {
    try {
      return await firstValueFrom(
        this.http.put<ContactDetail>(
          `/api/partner/${partnerId}/contact/${contactId}`,
          contactDetail
        )
      );
    } catch (error) {
      console.error('Failed to update contact:', error);
      throw error;
    }
  }

  async removeContactFromPartner(partnerId: string, contactId: string): Promise<void> {
    try {
      await firstValueFrom(
        this.http.delete<void>(`/api/partner/${partnerId}/contact/${contactId}`)
      );
    } catch (error) {
      console.error('Failed to remove contact from partner:', error);
      throw error;
    }
  }

  // Tag Management
  async loadTags(searchTerm?: string): Promise<Tag[]> {
    try {
      const url = searchTerm && searchTerm.trim() 
        ? `/api/tag?search=${encodeURIComponent(searchTerm)}`
        : '/api/tag';
      return await firstValueFrom(
        this.http.get<Tag[]>(url)
      );
    } catch (error) {
      console.error('Failed to load tags:', error);
      throw error;
    }
  }

  async createTag(tag: Tag): Promise<Tag> {
    try {
      return await firstValueFrom(
        this.http.post<Tag>('/api/tag', tag)
      );
    } catch (error) {
      console.error('Failed to create tag:', error);
      throw error;
    }
  }

  async deleteTag(tagId: string): Promise<void> {
    try {
      await firstValueFrom(
        this.http.delete<void>(`/api/tag/${tagId}`)
      );
    } catch (error) {
      console.error('Failed to delete tag:', error);
      throw error;
    }
  }

  // Partner Tag Management
  async loadPartnerTags(partnerId: string): Promise<Tag[]> {
    try {
      return await firstValueFrom(
        this.http.get<Tag[]>(`/api/partner/${partnerId}/tag`)
      );
    } catch (error) {
      console.error('Failed to load partner tags:', error);
      throw error;
    }
  }

  async addTagToPartner(partnerId: string, tagId: string): Promise<PartnerTag> {
    try {
      return await firstValueFrom(
        this.http.post<PartnerTag>(`/api/partner/${partnerId}/tag/${tagId}`, {})
      );
    } catch (error) {
      console.error('Failed to add tag to partner:', error);
      throw error;
    }
  }

  async removeTagFromPartner(partnerId: string, tagId: string): Promise<void> {
    try {
      await firstValueFrom(
        this.http.delete<void>(`/api/partner/${partnerId}/tag/${tagId}`)
      );
    } catch (error) {
      console.error('Failed to remove tag from partner:', error);
      throw error;
    }
  }
}
