export default {
    routes: [
        {
            method: 'POST',
            path: '/sync-user',
            handler: 'user-sync.sync',
            config: {
                auth: false,
                middlewares: ['global::supabase-auth'],
            },
        },
    ],
};