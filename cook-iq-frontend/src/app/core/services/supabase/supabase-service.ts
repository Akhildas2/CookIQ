import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  // Holds the initialized Supabase client instance
  readonly client: SupabaseClient;

  constructor() {
    if (!environment.supabase.anonKey) {
      throw new Error('Supabase API key is missing');
    }

    // Create and configure the Supabase client using environment variables
    this.client = createClient(
      environment.supabase.url, // Supabase project URL
      environment.supabase.anonKey // Supabase public (anon) API key
    );
  }

}