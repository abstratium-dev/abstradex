import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../core/toast/toast.service';
import { ConfirmDialogService } from '../core/confirm-dialog/confirm-dialog.service';
import { AutofocusDirective } from '../core/autofocus.directive';
import { RelationshipType } from '../models/partner.model';
import { Controller } from '../controller';

@Component({
  selector: 'app-relationship-type',
  imports: [CommonModule, FormsModule, AutofocusDirective],
  templateUrl: './relationship-type.component.html',
  styleUrls: ['./relationship-type.component.scss']
})
export class RelationshipTypeComponent implements OnInit {
  private controller = inject(Controller);
  private toastService = inject(ToastService);
  private confirmService = inject(ConfirmDialogService);

  relationshipTypes: RelationshipType[] = [];
  loading = false;
  error: string | null = null;

  // Add/Edit Form state
  showForm = false;
  formSubmitting = false;
  formError: string | null = null;
  editingType: RelationshipType | null = null;
  typeForm: RelationshipType = {
    typeName: '',
    colorHex: '#4285f4',
    description: '',
    isActive: true
  };

  // Search state
  searchTerm = '';
  private searchTimeout: any;

  // Context menu state
  activeContextMenuIndex: number | null = null;

  ngOnInit(): void {
    this.loadRelationshipTypes();
  }

  async loadRelationshipTypes(searchTerm?: string): Promise<void> {
    this.loading = true;
    this.error = null;
    try {
      this.relationshipTypes = await this.controller.loadRelationshipTypes(searchTerm);
    } catch (err) {
      this.error = 'Failed to load relationship types';
      this.toastService.error(this.error);
    } finally {
      this.loading = false;
    }
  }

  onSearchChange(): void {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    this.searchTimeout = setTimeout(() => {
      this.loadRelationshipTypes(this.searchTerm || undefined);
    }, 300);
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.loadRelationshipTypes();
  }

  toggleAddForm(): void {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.resetForm();
    }
  }

  resetForm(): void {
    this.editingType = null;
    this.typeForm = {
      typeName: '',
      colorHex: '#4285f4',
      description: '',
      isActive: true
    };
    this.formError = null;
  }

  cancelForm(): void {
    this.showForm = false;
    this.resetForm();
  }

  async onSubmit(): Promise<void> {
    if (!this.typeForm.typeName || this.typeForm.typeName.trim() === '') {
      this.formError = 'Type name is required';
      return;
    }

    this.formSubmitting = true;
    this.formError = null;

    try {
      if (this.editingType) {
        await this.controller.updateRelationshipType(this.editingType.id!, this.typeForm);
        this.toastService.success('Relationship type updated successfully');
      } else {
        await this.controller.createRelationshipType(this.typeForm);
        this.toastService.success('Relationship type created successfully');
      }
      this.showForm = false;
      this.resetForm();
      await this.loadRelationshipTypes();
    } catch (err: any) {
      this.formError = err.error?.message || 'Failed to save relationship type';
      this.toastService.error(this.formError || 'Failed to save relationship type');
    } finally {
      this.formSubmitting = false;
    }
  }

  toggleContextMenu(event: Event, index: number): void {
    event.stopPropagation();
    this.activeContextMenuIndex = this.activeContextMenuIndex === index ? null : index;
  }

  closeContextMenu(index: number): void {
    if (this.activeContextMenuIndex === index) {
      this.activeContextMenuIndex = null;
    }
  }

  onEdit(relationshipType: RelationshipType, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.activeContextMenuIndex = null;
    this.editingType = relationshipType;
    this.typeForm = {
      typeName: relationshipType.typeName,
      description: relationshipType.description,
      colorHex: relationshipType.colorHex || '#4285f4',
      isActive: relationshipType.isActive !== false
    };
    this.showForm = true;
  }

  async onDelete(relationshipType: RelationshipType, event?: Event): Promise<void> {
    if (event) {
      event.stopPropagation();
    }
    this.activeContextMenuIndex = null;
    const confirmed = await this.confirmService.confirm({
      title: 'Delete Relationship Type',
      message: `Are you sure you want to delete "${relationshipType.typeName}"? This action cannot be undone.`
    });

    if (confirmed && relationshipType.id) {
      try {
        await this.controller.deleteRelationshipType(relationshipType.id);
        this.toastService.success('Relationship type deleted successfully');
        await this.loadRelationshipTypes();
      } catch (err) {
        this.toastService.error('Failed to delete relationship type');
      }
    }
  }

  getTypeStyle(relationshipType: RelationshipType): any {
    return {
      'background-color': relationshipType.colorHex || '#6c757d',
      'color': '#ffffff'
    };
  }
}
