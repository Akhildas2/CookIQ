/**
 * pantry-item router
 */

const protectedRoute = (method: string, path: string, handler: string) => ({
    method,
    path,
    handler,
    config: { auth: false, middlewares: ['global::supabase-auth'] },
});

export default {
    routes: [
        protectedRoute('GET', '/pantry/items', 'pantry-item.list'),
        protectedRoute('POST', '/pantry/items', 'pantry-item.create'),
        protectedRoute('POST', '/pantry/items/bulk', 'pantry-item.bulkCreate'),
        protectedRoute('PUT', '/pantry/items/:id', 'pantry-item.update'),
        protectedRoute('DELETE', '/pantry/items/:id', 'pantry-item.remove'),
        protectedRoute('POST', '/pantry/scan', 'pantry-item.scan'),
    ],
};