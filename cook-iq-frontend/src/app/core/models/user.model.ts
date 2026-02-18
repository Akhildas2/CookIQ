export interface SupabaseUser {
    id: string;
    email: string;
    email_confirmed_at?: string;
    phone?: string;
    confirmed_at?: string;
    user_metadata?: {
        full_name?: string;
        avatar_url?: string;
        first_name?: string;
        last_name?: string;
    };
    app_metadata?: {
        provider?: string;
        providers?: string[];
    };
    created_at?: string;
}

export interface StrapiUser {
    id: number;
    username: string;
    email: string;
    confirmed: boolean;
    blocked: boolean;
    supabaseId: string;
    firstName?: string;
    lastName?: string;
    imageUrl?: string;
    subscriptionTier: 'free' | 'pro' | 'premium';
    provider?: string;
    role?: {
        id: number;
        name: string;
        type: string;
    };
    createdAt?: string;
    updatedAt?: string;
}

export interface SyncUserResponse {
    user: StrapiUser;
    isNewUser: boolean;
    message: string;
}