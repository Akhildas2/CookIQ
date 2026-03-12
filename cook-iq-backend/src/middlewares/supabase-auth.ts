import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import type { Context, Next } from 'koa';

// Extend Koa state type
interface SupabaseState {
    supabaseUser?: User;
}

const supabase = createClient(
    process.env.SUPABASE_URL as string,
    process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

export default () => {
    return async (
        ctx: Context & { state: SupabaseState },
        next: Next
    ) => {
        const authHeader = ctx.request.header.authorization;

        if (!authHeader) {
            return ctx.unauthorized('No token provided');
        }

        const token = authHeader.split(' ')[1];

        if (!token) {
            return ctx.unauthorized('Malformed token');
        }

        // Attach token dynamically instead of recreating client
        const { data, error } = await supabase.auth.getUser(token);

        if (error || !data?.user) {
            return ctx.unauthorized('Invalid token');
        }

        ctx.state.supabaseUser = data.user;

        await next();
    };
};