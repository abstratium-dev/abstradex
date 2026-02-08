import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ToastService } from '../core/toast/toast.service';
import { ConfirmDialogService } from '../core/confirm-dialog/confirm-dialog.service';
import { Controller } from '../controller';
import { ModelService } from '../model.service';
import { Tag } from '../models/partner.model';
import { Partner } from '../models/partner.model';
import { PartnerService } from '../partner.service';

@Component({
  selector: 'app-partner-tag',
  imports: [CommonModule, FormsModule],
  templateUrl: './partner-tag.component.html',
  styleUrl: './partner-tag.component.scss'
})
export class PartnerTagComponent implements OnInit {
  private controller = inject(Controller);
  private modelService = inject(ModelService);
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);
  private location = inject(Location);
  private toastService = inject(ToastService);
  private confirmService = inject(ConfirmDialogService);
  private partnerService = inject(PartnerService);

  partnerId = '';
  partner: Partner | null = null;
  partnerTags: Tag[] = [];
  allTags: Tag[] = [];
  loading = false;
  error: string | null = null;

  // Add tag form
  showAddForm = false;
  showCreateForm = false;
  selectedTagId = '';
  
  // Create new tag form
  newTag: Tag = this.getEmptyTag();

  getPartnerName(): string {
    if (!this.partner) return 'Loading...';
    return this.partnerService.getPartnerName(this.partner);
  }

  getEmptyTag(): Tag {
    return {
      tagName: '',
      colorHex: '#3B82F6',
      description: ''
    };
  }

  ngOnInit(): void {
    this.partnerId = this.route.snapshot.paramMap.get('partnerId') || '';
    if (this.partnerId) {
      this.loadPartnerData();
      this.loadPartnerTags();
      this.loadAllTags();
    }
  }

  async loadPartnerData(): Promise<void> {
    try {
      this.partner = await firstValueFrom(
        this.http.get<Partner>(`/api/partner/${this.partnerId}`)
      );

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

  async loadPartnerTags(): Promise<void> {
    this.loading = true;
    this.error = null;
    try {
      this.partnerTags = await this.controller.loadPartnerTags(this.partnerId);
    } catch (err) {
      this.error = 'Failed to load partner tags';
      this.toastService.error(this.error);
    } finally {
      this.loading = false;
    }
  }

  async loadAllTags(): Promise<void> {
    try {
      this.allTags = await this.controller.loadTags();
    } catch (err) {
      console.error('Failed to load all tags:', err);
    }
  }

  getAvailableTags(): Tag[] {
    const partnerTagIds = new Set(this.partnerTags.map(t => t.id));
    return this.allTags.filter(t => !partnerTagIds.has(t.id));
  }

  toggleAddForm(): void {
    this.showAddForm = !this.showAddForm;
    if (this.showAddForm) {
      this.selectedTagId = '';
      this.showCreateForm = false;
    }
  }

  toggleCreateForm(): void {
    this.showCreateForm = !this.showCreateForm;
    if (this.showCreateForm) {
      this.newTag = this.getEmptyTag();
      this.showAddForm = false;
    }
  }

  async onAddExistingTag(): Promise<void> {
    if (!this.selectedTagId) {
      this.toastService.error('Please select a tag');
      return;
    }

    try {
      await this.controller.addTagToPartner(this.partnerId, this.selectedTagId);
      this.toastService.success('Tag added to partner');
      this.showAddForm = false;
      this.selectedTagId = '';
      await this.loadPartnerTags();
    } catch (err) {
      this.toastService.error('Failed to add tag to partner');
    }
  }

  async onCreateNewTag(): Promise<void> {
    if (!this.newTag.tagName || !this.newTag.tagName.trim()) {
      this.toastService.error('Please enter a tag name');
      return;
    }

    try {
      await this.controller.createTag(this.newTag);
      this.toastService.success('Tag created successfully. You can now search and add it to the partner.');
      
      this.showCreateForm = false;
      this.newTag = this.getEmptyTag();
      await this.loadAllTags();
    } catch (err) {
      this.toastService.error('Failed to create tag');
    }
  }

  async onRemoveTag(tag: Tag): Promise<void> {
    const confirmed = await this.confirmService.confirm({
      title: 'Remove Tag',
      message: `Are you sure you want to remove the tag "${tag.tagName}" from this partner?`
    });

    if (confirmed && tag.id) {
      try {
        await this.controller.removeTagFromPartner(this.partnerId, tag.id);
        this.toastService.success('Tag removed from partner');
        await this.loadPartnerTags();
      } catch (err) {
        this.toastService.error('Failed to remove tag from partner');
      }
    }
  }

  goBack(): void {
    this.location.back();
  }

  getPartnerNumberAndName(): string {
    if (this.partner == null) return "";
    return this.partner.partnerNumber + " " + this.partnerService.getPartnerName(this.partner);
  }

  getTagStyle(tag: Tag): any {
    return {
      'background-color': tag.colorHex || '#3B82F6',
      'color': this.getContrastColor(tag.colorHex || '#3B82F6')
    };
  }

  getContrastColor(hexColor: string): string {
    // Convert hex to RGB
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // Return black or white based on luminance
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
  }
}
