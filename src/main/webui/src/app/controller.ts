import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Demo, Partner, ModelService } from './model.service';

@Injectable({
  providedIn: 'root',
})
export class Controller {

  private modelService = inject(ModelService);
  private http = inject(HttpClient);

  loadDemos() {
    this.modelService.setDemosLoading(true);
    this.modelService.setDemosError(null);
    
    this.http.get<Demo[]>('/api/demo').subscribe({
      next: (demos) => {
        this.modelService.setDemos(demos);
        this.modelService.setDemosLoading(false);
      },
      error: (err) => {
        console.error('Error loading demos:', err);
        this.modelService.setDemos([]);
        this.modelService.setDemosError('Failed to load demos');
        this.modelService.setDemosLoading(false);
      }
    });
  }

  async createDemo(): Promise<Demo> {
    try {
      const response = await firstValueFrom(
        this.http.post<Demo>('/api/demo', {})
      );
      // Reload demos list after successful creation
      this.loadDemos();
      return response;
    } catch (error) {
      console.error('Error creating demo:', error);
      throw error;
    }
  }

  async updateDemo(demo: Demo): Promise<Demo> {
    try {
      const response = await firstValueFrom(
        this.http.put<Demo>('/api/demo', demo)
      );
      // Reload demos list after successful update
      this.loadDemos();
      return response;
    } catch (error) {
      console.error('Error updating demo:', error);
      throw error;
    }
  }

  async deleteDemo(id: string): Promise<void> {
    try {
      await firstValueFrom(
        this.http.delete<void>(`/api/demo/${id}`)
      );
      // Reload demos list after successful deletion
      this.loadDemos();
    } catch (error) {
      console.error('Error deleting demo:', error);
      throw error;
    }
  }

  async triggerError(): Promise<void> {
    try {
      await firstValueFrom(
        this.http.get<void>('/api/demo/error')
      );
    } catch (error) {
      console.error('Error response:', error);
      throw error;
    }
  }

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
}
