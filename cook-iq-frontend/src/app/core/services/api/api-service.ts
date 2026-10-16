import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { SupabaseService } from '../supabase/supabase-service';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly supabase = inject(SupabaseService);
  private readonly base = `${environment.strapi.url}/api`;


  private async getAuthHeaders(): Promise<HttpHeaders> {
    const { data: { session }, error } = await this.supabase.client.auth.getSession();

    if (error) {
      throw error;
    }

    let headers = new HttpHeaders();

    if (session?.access_token) {
      headers = headers.set(
        'Authorization',
        `Bearer ${session.access_token}`,
      );
    }

    return headers;
  }

  async get<T>(path: string, params?: Record<string, string>,): Promise<T> {
    const headers = await this.getAuthHeaders();

    return firstValueFrom(
      this.http.get<T>(`${this.base}${path}`, {
        headers,
        params: new HttpParams({ fromObject: params ?? {} }),
      }),
    );
  }

  async post<T>(path: string, body: unknown = {}): Promise<T> {
    const headers = await this.getAuthHeaders();

    return firstValueFrom(
      this.http.post<T>(`${this.base}${path}`, body, {
        headers,
      }),
    );
  }

  async put<T>(path: string, body: unknown): Promise<T> {
    const headers = await this.getAuthHeaders();

    return firstValueFrom(
      this.http.put<T>(`${this.base}${path}`, body, {
        headers,
      }),
    );
  }

  async delete<T>(path: string): Promise<T> {
    const headers = await this.getAuthHeaders();

    return firstValueFrom(
      this.http.delete<T>(`${this.base}${path}`, {
        headers,
      }),
    );
  }

}