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

  private addresses = signal<Address[]>([]);
  private addressesLoading = signal<boolean>(false);
  private addressesError = signal<string | null>(null);

  private countries = signal<Country[]>([]);

  config$: Signal<Config | null> = this.config.asReadonly();

  partners$: Signal<Partner[]> = this.partners.asReadonly();
  partnersLoading$: Signal<boolean> = this.partnersLoading.asReadonly();
  partnersError$: Signal<string | null> = this.partnersError.asReadonly();

  addresses$: Signal<Address[]> = this.addresses.asReadonly();
  addressesLoading$: Signal<boolean> = this.addressesLoading.asReadonly();
  addressesError$: Signal<string | null> = this.addressesError.asReadonly();

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

  setAddresses(addresses: Address[]) {
    this.addresses.set(addresses);
  }

  setAddressesLoading(loading: boolean) {
    this.addressesLoading.set(loading);
  }

  setAddressesError(error: string | null) {
    this.addressesError.set(error);
  }

  setCountries(countries: Country[]) {
    this.countries.set(countries);
  }
}
