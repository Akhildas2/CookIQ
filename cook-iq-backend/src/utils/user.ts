export async function getCurrentUser(ctx: any) {
    const sb = ctx.state.supabaseUser;
    if (!sb) return null;

    const user = await strapi.db.query('plugin::users-permissions.user').findOne({
        where: { $or: [{ supabaseId: sb.id }, { email: sb.email }] },
    });
    return user || null;
}

export async function isProUser(userId: number): Promise<boolean> {
    const sub = await strapi.db.query('api::subscription.subscription').findOne({
        where: { user: { id: userId } },
    });
    return !!sub && ['pro', 'premium'].includes(sub.plan) && sub.subscriptionStatus === 'active';
}