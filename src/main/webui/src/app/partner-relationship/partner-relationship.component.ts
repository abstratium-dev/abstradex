import { Component, inject, OnInit, effect } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '../core/toast/toast.service';
import { ConfirmDialogService } from '../core/confirm-dialog/confirm-dialog.service';
import { AutocompleteComponent, AutocompleteOption } from '../core/autocomplete/autocomplete.component';
import { Controller } from '../controller';
import { ModelService } from '../model.service';
import { Partner, PartnerRelationship, RelationshipType } from '../models/partner.model';
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
  relationshipTypes: RelationshipType[] = [];
  loading = false;
  error: string | null = null;

  // Add relationship form
  showAddForm = false;
  selectedPartnerId = '';
  selectedRelationshipTypeId = '';
  newRelationship: PartnerRelationship = {
    notes: ''
  };

  // Cached autocomplete options
  private cachedOptions: AutocompleteOption[] = [];
  private currentSearchTerm = '';
  private resolveOptions: ((options: AutocompleteOption[]) => void) | null = null;

  // Context menu state
  activeRelationshipContextMenuIndex: number | null = null;

  constructor() {
    // Set up reactive effect to update autocomplete when partners change
    effect(() => {
      const partners = this.modelService.partners$();
      const options = partners
        .filter(p => p.id !== this.partnerId)
        .map(p => ({
          value: p.id || '',
          label: this.formatPartnerLabel(p)
        }));
      
      this.cachedOptions = options;
      
      // If there's a pending promise, resolve it
      if (this.resolveOptions) {
        this.resolveOptions(options);
        this.resolveOptions = null;
      }
    });
  }

  // Autocomplete fetch function
  fetchPartners = async (searchTerm: string): Promise<AutocompleteOption[]> => {
    this.currentSearchTerm = searchTerm;
    this.controller.loadPartners(searchTerm);
    
    // Return a promise that will be resolved by the effect when partners update
    return new Promise((resolve) => {
      // If partners are already loaded for this search, return immediately
      if (this.modelService.lastPartnerSearchTerm$() === searchTerm && !this.modelService.partnersLoading$()) {
        resolve(this.cachedOptions);
      } else {
        // Otherwise, wait for the effect to resolve it
        this.resolveOptions = resolve;
      }
    });
  };

  ngOnInit(): void {
    this.partnerId = this.route.snapshot.paramMap.get('partnerId') || '';
    if (this.partnerId) {
      this.loadPartnerData();
      this.loadPartnerRelationships();
      this.loadRelationshipTypes();
    }
  }

  async loadRelationshipTypes(): Promise<void> {
    try {
      this.relationshipTypes = await this.controller.loadActiveRelationshipTypes();
    } catch (err) {
      console.error('Failed to load relationship types:', err);
      this.toastService.error('Failed to load relationship types');
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
    this.selectedRelationshipTypeId = '';
    const today = new Date().toISOString().split('T')[0];
    this.newRelationship = {
      effectiveFrom: today,
      notes: ''
    };
  }

  async onSubmitAdd(): Promise<void> {
    if (!this.selectedPartnerId) {
      this.toastService.error('Please select a partner');
      return;
    }

    if (!this.selectedRelationshipTypeId) {
      this.toastService.error('Please select a relationship type');
      return;
    }

    // Find the selected relationship type
    const selectedType = this.relationshipTypes.find(t => t.id === this.selectedRelationshipTypeId);
    if (!selectedType) {
      this.toastService.error('Invalid relationship type selected');
      return;
    }
    this.newRelationship.relationshipType = selectedType;

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

  toggleRelationshipContextMenu(event: Event, index: number): void {
    event.stopPropagation();
    this.activeRelationshipContextMenuIndex = this.activeRelationshipContextMenuIndex === index ? null : index;
  }

  closeRelationshipContextMenu(index: number): void {
    if (this.activeRelationshipContextMenuIndex === index) {
      this.activeRelationshipContextMenuIndex = null;
    }
  }

  async onDelete(relationship: PartnerRelationship, event?: Event): Promise<void> {
    if (event) {
      event.stopPropagation();
    }
    this.activeRelationshipContextMenuIndex = null;
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

  goToRelationshipTypeManagement(): void {
    this.router.navigate(['/relationship-types']);
  }

  goBack(): void {
    this.location.back();
  }

  // Helper methods for relationship display
  getRelatedPartnerName(relationship: PartnerRelationship): string {
    const relatedPartner = this.getRelatedPartner(relationship);
    if (!relatedPartner) return 'Unknown Partner';
    return this.partnerService.getPartnerName(relatedPartner);
  }

  getDirection(relationship: PartnerRelationship): 'outgoing' | 'incoming' {
    return relationship.fromPartner?.id === this.partnerId ? 'outgoing' : 'incoming';
  }

  getDirectionLabel(relationship: PartnerRelationship): string {
    return this.getDirection(relationship) === 'outgoing' ? 'to' : 'from';
  }

  getDirectionArrow(relationship: PartnerRelationship): string {
    return this.getDirection(relationship) === 'outgoing' ? '→' : '←';
  }

  formatDate(dateString?: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }

  navigateToPartner(event: Event, relationship: PartnerRelationship): void {
    event.stopPropagation();
    const relatedPartner = this.getRelatedPartner(relationship);
    if (relatedPartner?.id) {
      this.router.navigate(['/partners', relatedPartner.id]);
    }
  }

  navigateToRelationshipTypes(event: Event): void {
    event.stopPropagation();
    this.router.navigate(['/relationship-types']);
  }

  getRelationshipTypeDescription(relationship: PartnerRelationship): string {
    return relationship.relationshipType?.description || '';
  }

  getRelationshipTypeTooltip(relationship: PartnerRelationship): string {
    const description = this.getRelationshipTypeDescription(relationship);
    return description || relationship.relationshipType?.typeName || '';
  }

  getRelationshipTypeName(relationship: PartnerRelationship): string {
    return relationship.relationshipType?.typeName || 'Unknown Type';
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
