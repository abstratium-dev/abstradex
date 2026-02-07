import { Injectable, signal, Signal } from '@angular/core';
import { Address } from './models/address.model';
import { Config, Country } from './models/config.model';
import { Partner } from './models/partner.model';

// Re-export models for backward compatibility
export type { Address, Config, Country, LegalEntity, NaturalPerson, Partner } from './models';

@Injectable({
  providedIn: 'root',
})
export class ModelService {

  private config = signal<Config | null>(null);

  private partners = signal<Partner[]>([]);
  private partnersLoading = signal<boolean>(false);
  private partnersError = signal<string | null>(null);
  private partnersLoadTime = signal<number | null>(null);
  private lastPartnerSearchTerm = signal<string>('');

  private addresses = signal<Address[]>([]);
  private addressesLoading = signal<boolean>(false);
  private addressesError = signal<string | null>(null);
  private addressesLoadTime = signal<number | null>(null);
  private lastAddressSearchTerm = signal<string>('');

  private countries = signal<Country[]>([]);

  config$: Signal<Config | null> = this.config.asReadonly();

  partners$: Signal<Partner[]> = this.partners.asReadonly();
  partnersLoading$: Signal<boolean> = this.partnersLoading.asReadonly();
  partnersError$: Signal<string | null> = this.partnersError.asReadonly();
  partnersLoadTime$: Signal<number | null> = this.partnersLoadTime.asReadonly();
  lastPartnerSearchTerm$: Signal<string> = this.lastPartnerSearchTerm.asReadonly();

  addresses$: Signal<Address[]> = this.addresses.asReadonly();
  addressesLoading$: Signal<boolean> = this.addressesLoading.asReadonly();
  addressesError$: Signal<string | null> = this.addressesError.asReadonly();
  addressesLoadTime$: Signal<number | null> = this.addressesLoadTime.asReadonly();
  lastAddressSearchTerm$: Signal<string> = this.lastAddressSearchTerm.asReadonly();

  countries$: Signal<Country[]> = this.countries.asReadonly();

  setConfig(config: Config) {
    this.config.set(config);
  }

  setPartners(partners: Partner[]) {
    this.partners.set(partners);
  }

  setPartnersLoading(loading: boolean) {
    this.partnersLoading.set(loading);
  }

  setPartnersError(error: string | null) {
    this.partnersError.set(error);
  }

  setPartnersLoadTime(loadTime: number | null) {
    this.partnersLoadTime.set(loadTime);
  }

  setAddresses(addresses: Address[]) {
    this.addresses.set(addresses);
  }

  setAddressesLoading(loading: boolean) {
    this.addressesLoading.set(loading);
  }

  setAddressesError(error: string | null) {
    this.addressesError.set(error);
  }

  setAddressesLoadTime(loadTime: number | null) {
    this.addressesLoadTime.set(loadTime);
  }

  setCountries(countries: Country[]): void {
    this.countries.set(countries);
  }

  setLastPartnerSearchTerm(searchTerm: string): void {
    this.lastPartnerSearchTerm.set(searchTerm);
  }

  setLastAddressSearchTerm(searchTerm: string): void {
    this.lastAddressSearchTerm.set(searchTerm);
  }

  /**
   * Get country name by code
   */
  getCountryName(code: string): string {
    const country = this.countries().find(c => c.code === code);
    return country?.name || code;
  }
}
