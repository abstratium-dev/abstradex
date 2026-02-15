import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../core/toast/toast.service';
import { ConfirmDialogService } from '../core/confirm-dialog/confirm-dialog.service';
import { AutofocusDirective } from '../core/autofocus.directive';
import { Tag } from '../models/partner.model';
import { Controller } from '../controller';

@Component({
  selector: 'app-tag',
  imports: [CommonModule, FormsModule, AutofocusDirective],
  templateUrl: './tag.component.html',
  styleUrl: './tag.component.scss'
})
export class TagComponent implements OnInit {
  private controller = inject(Controller);
  private toastService = inject(ToastService);
  private confirmService = inject(ConfirmDialogService);

  tags: Tag[] = [];
  loading = false;
  error: string | null = null;

  // Add/Edit Tag Form state
  showForm = false;
  formSubmitting = false;
  formError: string | null = null;
  editingTag: Tag | null = null;
  tagForm: Tag = {
    tagName: '',
    colorHex: '#4285f4',
    description: ''
  };

  // Search state
  searchTerm = '';
  private searchTimeout: any;

  // Context menu state
  activeContextMenuIndex: number | null = null;

  ngOnInit(): void {
    this.loadTags();
  }

  async loadTags(searchTerm?: string): Promise<void> {
    this.loading = true;
    this.error = null;
    try {
      this.tags = await this.controller.loadTags(searchTerm);
    } catch (err) {
      this.error = 'Failed to load tags';
      this.toastService.error(this.error);
    } finally {
      this.loading = false;
    }
  }

  onSearchChange(): void {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.loadTags(this.searchTerm);
    }, 300);
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.loadTags();
  }

  toggleAddForm(): void {
    if (this.showForm) {
      this.cancelForm();
    } else {
      this.showForm = true;
      this.editingTag = null;
      this.resetForm();
    }
  }

  resetForm(): void {
    this.tagForm = {
      tagName: '',
      colorHex: '#4285f4',
      description: ''
    };
    this.formError = null;
  }

  cancelForm(): void {
    this.showForm = false;
    this.editingTag = null;
    this.resetForm();
  }

  async onSubmit(): Promise<void> {
    if (!this.tagForm.tagName?.trim()) {
      this.formError = 'Tag name is required';
      return;
    }

    this.formSubmitting = true;
    this.formError = null;

    try {
      if (this.editingTag) {
        await this.controller.updateTag(this.editingTag.id!, this.tagForm);
        this.toastService.success('Tag updated successfully');
      } else {
        await this.controller.createTag(this.tagForm);
        this.toastService.success('Tag created successfully');
      }
      
      await this.loadTags(this.searchTerm);
      this.cancelForm();
    } catch (err: any) {
      this.formError = err.error?.message || 'Failed to save tag';
      if (this.formError) {
        this.toastService.error(this.formError);
      }
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

  onEdit(tag: Tag, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.activeContextMenuIndex = null;
    this.editingTag = tag;
    this.tagForm = { ...tag };
    this.showForm = true;
  }

  async onDelete(tag: Tag, event?: Event): Promise<void> {
    if (event) {
      event.stopPropagation();
    }
    this.activeContextMenuIndex = null;
    const confirmed = await this.confirmService.confirm({
      title: 'Delete Tag',
      message: `Are you sure you want to delete the tag "${tag.tagName}"? This will remove it from all partners.`
    });

    if (!confirmed) {
      return;
    }

    try {
      await this.controller.deleteTag(tag.id!);
      this.toastService.success('Tag deleted successfully');
      await this.loadTags(this.searchTerm);
    } catch (err: any) {
      const errorMsg = err.error?.message || 'Failed to delete tag';
      this.toastService.error(errorMsg);
    }
  }

  getTagStyle(tag: Tag): any {
    return {
      'background-color': tag.colorHex || '#4285f4',
      'color': 'white'
    };
  }
}
