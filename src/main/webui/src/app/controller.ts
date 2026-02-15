import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Address, Country, ModelService, Partner } from './model.service';
import { AddressDetail } from './models/address-detail.model';
import { ContactDetail } from './models/contact-detail.model';
import { Tag, PartnerRelationship, RelationshipType } from './models/partner.model';
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

  loadPartners(searchTerm: string) {
    if(!searchTerm) {
        this.modelService.setPartners([]);
        this.modelService.setPartnersError(null);
        this.modelService.setPartnersLoading(false);
    } else {
      this.modelService.setPartnersLoading(true);
      this.modelService.setPartnersError(null);
      this.modelService.setLastPartnerSearchTerm(searchTerm);
      
      const startTime = performance.now();
      const url = `/api/partner?search=${encodeURIComponent(searchTerm)}`;
      
      this.http.get<Partner[]>(url).subscribe({
        next: (partners) => {
          const loadTime = Math.round(performance.now() - startTime);
          this.modelService.setPartners(partners);
          this.modelService.setPartnersLoadTime(loadTime);
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
  }

  async createPartner(partner: Partner): Promise<Partner> {
    try {
      const response = await firstValueFrom(
        this.http.post<Partner>('/api/partner', partner)
      );
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
    } catch (error) {
      console.error('Error deleting partner:', error);
      throw error;
    }
  }

  clearPartners() {
    this.modelService.setPartners([]);
  }

  async getPartnerById(id: string): Promise<Partner | null> {
    try {
      const partner = await firstValueFrom(
        this.http.get<Partner>(`/api/partner/${id}`)
      );
      return partner;
    } catch (error) {
      console.error('Error fetching partner by ID:', error);
      return null;
    }
  }

  async loadAddresses(searchTerm: string): Promise<void> {
    if(!searchTerm) {
      this.modelService.setAddresses([]);
      this.modelService.setAddressesError(null);
      this.modelService.setAddressesLoading(false);
    } else {
      this.modelService.setAddressesLoading(true);
      this.modelService.setAddressesError(null);
      
      const startTime = performance.now();
      const url = `/api/address?search=${encodeURIComponent(searchTerm)}`;
  
      try {
        const addresses = await firstValueFrom(this.http.get<Address[]>(url));
        const loadTime = Math.round(performance.now() - startTime);
        this.modelService.setAddresses(addresses);
        this.modelService.setAddressesLoadTime(loadTime);
      } catch (err) {
        console.error('Error loading addresses:', err);
        this.modelService.setAddresses([]);
        this.modelService.setAddressesError('Failed to load addresses');
      } finally {
        this.modelService.setAddressesLoading(false);
      }
    }
  }

  async createAddress(address: Address): Promise<Address> {
    try {
      const response = await firstValueFrom(
        this.http.post<Address>('/api/address', address)
      );
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
    } catch (error) {
      console.error('Error deleting address:', error);
      throw error;
    }
  }

  clearAddresses() {
    this.modelService.setAddresses([]);
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

  async updateTag(tagId: string, tag: Tag): Promise<Tag> {
    try {
      return await firstValueFrom(
        this.http.put<Tag>(`/api/tag/${tagId}`, tag)
      );
    } catch (error) {
      console.error('Failed to update tag:', error);
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
    if (!partnerId || partnerId.trim() === '') {
      throw new Error('Partner ID is required to load partner tags');
    }
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
    if (!partnerId || partnerId.trim() === '') {
      throw new Error('Partner ID is required to add tag to partner');
    }
    if (!tagId || tagId.trim() === '') {
      throw new Error('Tag ID is required to add tag to partner');
    }
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
    if (!partnerId || partnerId.trim() === '') {
      throw new Error('Partner ID is required to remove tag from partner');
    }
    if (!tagId || tagId.trim() === '') {
      throw new Error('Tag ID is required to remove tag from partner');
    }
    try {
      await firstValueFrom(
        this.http.delete<void>(`/api/partner/${partnerId}/tag/${tagId}`)
      );
    } catch (error) {
      console.error('Failed to remove tag from partner:', error);
      throw error;
    }
  }

  // Partner Relationship Management
  async loadPartnerRelationships(partnerId: string): Promise<PartnerRelationship[]> {
    if (!partnerId || partnerId.trim() === '') {
      throw new Error('Partner ID is required to load partner relationships');
    }
    try {
      return await firstValueFrom(
        this.http.get<PartnerRelationship[]>(`/api/partner/${partnerId}/relationship`)
      );
    } catch (error) {
      console.error('Failed to load partner relationships:', error);
      throw error;
    }
  }

  async addRelationshipToPartner(partnerId: string, relatedPartnerId: string, relationship: PartnerRelationship): Promise<PartnerRelationship> {
    if (!partnerId || partnerId.trim() === '') {
      throw new Error('Partner ID is required to add relationship');
    }
    if (!relatedPartnerId || relatedPartnerId.trim() === '') {
      throw new Error('Related partner ID is required to add relationship');
    }
    try {
      return await firstValueFrom(
        this.http.post<PartnerRelationship>(
          `/api/partner/${partnerId}/relationship?relatedPartnerId=${relatedPartnerId}`,
          relationship
        )
      );
    } catch (error) {
      console.error('Failed to add relationship to partner:', error);
      throw error;
    }
  }

  async removeRelationshipFromPartner(partnerId: string, relationshipId: string): Promise<void> {
    if (!partnerId || partnerId.trim() === '') {
      throw new Error('Partner ID is required to remove relationship');
    }
    if (!relationshipId || relationshipId.trim() === '') {
      throw new Error('Relationship ID is required to remove relationship');
    }
    try {
      await firstValueFrom(
        this.http.delete<void>(`/api/partner/${partnerId}/relationship/${relationshipId}`)
      );
    } catch (error) {
      console.error('Failed to remove relationship from partner:', error);
      throw error;
    }
  }

  // Relationship Type Management
  async loadRelationshipTypes(searchTerm?: string): Promise<RelationshipType[]> {
    try {
      const url = searchTerm 
        ? `/api/relationship-type?search=${encodeURIComponent(searchTerm)}`
        : '/api/relationship-type';
      return await firstValueFrom(
        this.http.get<RelationshipType[]>(url)
      );
    } catch (error) {
      console.error('Failed to load relationship types:', error);
      throw error;
    }
  }

  async loadActiveRelationshipTypes(): Promise<RelationshipType[]> {
    try {
      return await firstValueFrom(
        this.http.get<RelationshipType[]>('/api/relationship-type?activeOnly=true')
      );
    } catch (error) {
      console.error('Failed to load active relationship types:', error);
      throw error;
    }
  }

  async createRelationshipType(relationshipType: RelationshipType): Promise<RelationshipType> {
    try {
      return await firstValueFrom(
        this.http.post<RelationshipType>('/api/relationship-type', relationshipType)
      );
    } catch (error) {
      console.error('Failed to create relationship type:', error);
      throw error;
    }
  }

  async updateRelationshipType(id: string, relationshipType: RelationshipType): Promise<RelationshipType> {
    try {
      return await firstValueFrom(
        this.http.put<RelationshipType>(`/api/relationship-type/${id}`, relationshipType)
      );
    } catch (error) {
      console.error('Failed to update relationship type:', error);
      throw error;
    }
  }

  async deleteRelationshipType(id: string): Promise<void> {
    try {
      await firstValueFrom(
        this.http.delete<void>(`/api/relationship-type/${id}`)
      );
    } catch (error) {
      console.error('Failed to delete relationship type:', error);
      throw error;
    }
  }
}
