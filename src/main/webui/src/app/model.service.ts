import { Injectable, signal, Signal } from '@angular/core';
import { Demo } from './models/demo.model';
import { Config } from './models/config.model';
import { Partner } from './models/partner.model';

// Re-export models for backward compatibility
export type { Demo, Config, Partner, NaturalPerson, LegalEntity } from './models';

@Injectable({
  providedIn: 'root',
})
export class ModelService {

  private demos = signal<Demo[]>([]);
  private demosLoading = signal<boolean>(false);
  private demosError = signal<string | null>(null);
  private config = signal<Config | null>(null);

  private partners = signal<Partner[]>([]);
  private partnersLoading = signal<boolean>(false);
  private partnersError = signal<string | null>(null);

  demos$: Signal<Demo[]> = this.demos.asReadonly();
  demosLoading$: Signal<boolean> = this.demosLoading.asReadonly();
  demosError$: Signal<string | null> = this.demosError.asReadonly();
  config$: Signal<Config | null> = this.config.asReadonly();

  partners$: Signal<Partner[]> = this.partners.asReadonly();
  partnersLoading$: Signal<boolean> = this.partnersLoading.asReadonly();
  partnersError$: Signal<string | null> = this.partnersError.asReadonly();

  setDemos(demos: Demo[]) {
    this.demos.set(demos);
  }

  setDemosLoading(loading: boolean) {
    this.demosLoading.set(loading);
  }

  setDemosError(error: string | null) {
    this.demosError.set(error);
  }

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
}
