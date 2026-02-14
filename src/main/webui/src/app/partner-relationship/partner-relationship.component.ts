import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '../core/toast/toast.service';
import { ConfirmDialogService } from '../core/confirm-dialog/confirm-dialog.service';
import { AutocompleteComponent, AutocompleteOption } from '../core/autocomplete/autocomplete.component';
import { Controller } from '../controller';
import { ModelService } from '../model.service';
import { Partner, PartnerRelationship } from '../models/partner.model';
import { PartnerService } from '../partner.service';

@Component({
  selector: 'app-partner-relationship',
  imports: [CommonModule, FormsModule, AutocompleteComponent],
  templateUrl: './partner-relationship.component.html',
  styleUrls: ['./partner-relationship.component.scss']
})
export class PartnerRelationshipComponent implements OnInit {
  private controller = inject(Controller);
  private modelService = inject(ModelService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private location = inject(Location);
  private toastService = inject(ToastService);
  private confirmService = inject(ConfirmDialogService);
  public partnerService = inject(PartnerService);

  partnerId = '';
  partner: Partner | null = null;
  partnerRelationships: PartnerRelationship[] = [];
  loading = false;
  error: string | null = null;

  // Add relationship form
  showAddForm = false;
  selectedPartnerId = '';
  newRelationship: PartnerRelationship = {
    relationshipType: '',
    notes: ''
  };

  // Autocomplete fetch function
  fetchPartners = async (searchTerm: string): Promise<AutocompleteOption[]> => {
    this.controller.loadPartners(searchTerm);
    const partners = this.modelService.partners$();
    return partners
      .filter(p => p.id !== this.partnerId) // Exclude current partner
      .map(p => ({
        value: p.id || '',
        label: this.formatPartnerLabel(p)
      }));
  };

  ngOnInit(): void {
    this.partnerId = this.route.snapshot.paramMap.get('partnerId') || '';
    if (this.partnerId) {
      this.loadPartnerData();
      this.loadPartnerRelationships();
    }
  }

  async loadPartnerData(): Promise<void> {
    try {
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

  async loadPartnerRelationships(): Promise<void> {
    this.loading = true;
    this.error = null;
    try {
      this.partnerRelationships = await this.controller.loadPartnerRelationships(this.partnerId);
    } catch (err) {
      this.error = 'Failed to load partner relationships';
      this.toastService.error(this.error);
    } finally {
      this.loading = false;
    }
  }

  formatPartnerLabel(partner: Partner): string {
    return `${partner.partnerNumber} - ${this.partnerService.getPartnerName(partner)}`;
  }

  onPartnerSelected(option: AutocompleteOption): void {
    this.selectedPartnerId = option.value;
  }

  toggleAddForm(): void {
    this.showAddForm = !this.showAddForm;
    if (this.showAddForm) {
      this.resetForm();
    }
  }

  resetForm(): void {
    this.selectedPartnerId = '';
    this.newRelationship = {
      relationshipType: '',
      notes: ''
    };
  }

  async onSubmitAdd(): Promise<void> {
    if (!this.selectedPartnerId) {
      this.toastService.error('Please select a partner');
      return;
    }

    try {
      await this.controller.addRelationshipToPartner(
        this.partnerId,
        this.selectedPartnerId,
        this.newRelationship
      );
      this.toastService.success('Relationship added to partner');
      this.showAddForm = false;
      this.resetForm();
      await this.loadPartnerRelationships();
    } catch (err) {
      this.toastService.error('Failed to add relationship to partner');
    }
  }

  async onDelete(relationship: PartnerRelationship): Promise<void> {
    const confirmed = await this.confirmService.confirm({
      title: 'Remove Relationship',
      message: 'Are you sure you want to remove this relationship?'
    });

    if (confirmed && relationship.id) {
      try {
        await this.controller.removeRelationshipFromPartner(this.partnerId, relationship.id);
        this.toastService.success('Relationship removed from partner');
        await this.loadPartnerRelationships();
      } catch (err) {
        this.toastService.error('Failed to remove relationship from partner');
      }
    }
  }

  goToPartnerManagement(): void {
    this.router.navigate(['/partners']);
  }

  goBack(): void {
    this.location.back();
  }

  getPartnerNumberAndName(): string {
    if (this.partner == null) return '';
    return this.partner.partnerNumber + ' ' + this.partnerService.getPartnerName(this.partner);
  }

  getRelatedPartner(relationship: PartnerRelationship): Partner | undefined {
    // Return the partner that is NOT the current partner
    if (relationship.fromPartner?.id === this.partnerId) {
      return relationship.toPartner;
    }
    return relationship.fromPartner;
  }

  getRelationshipDirection(relationship: PartnerRelationship): string {
    if (relationship.fromPartner?.id === this.partnerId) {
      return 'to';
    }
    return 'from';
  }
}
