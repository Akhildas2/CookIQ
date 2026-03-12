import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, } from 'rxjs';
import { SupabaseService } from '../supabase/supabase-service';

@Injectable({
  providedIn: 'root'
})
export class StrapiService {
  private readonly baseUrl = environment.strapi.url;

  constructor(private http: HttpClient, private supabaseService: SupabaseService) { }

  async syncUserWithStrapi(user: any) {
    if (!user) return;

    // Get Supabase session to retrieve access token for Strapi authentication
    const { data: { session } } = await this.supabaseService.client.auth.getSession();
    if (!session?.access_token) {
      throw new Error('No Supabase session available');
    }
    const accessToken = session.access_token; // Use access token for authenticated requests to Strapi

    // Make authenticated request to Strapi to sync user data
    return await firstValueFrom(
      this.http.post(`${this.baseUrl}/api/sync-user`, {
        supabaseId: user.id,
        email: user.email,
        fullName: user.user_metadata?.full_name,
        avatarUrl: user.user_metadata?.avatar_url,
      },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
    );
  }

}