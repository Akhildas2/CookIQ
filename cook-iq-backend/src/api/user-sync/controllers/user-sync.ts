export default {
    async sync(ctx) {
        try {
            const { supabaseId, email, fullName, avatarUrl } = ctx.request.body;

            if (!supabaseId || !email) {
                return ctx.badRequest('Missing required fields');
            }

            // find existing user
            const existingUsers = await strapi.entityService.findMany(
                'plugin::users-permissions.user',
                {
                    filters: { supabaseId },
                    populate: ['subscription'],
                }
            );

            let user;

            if (existingUsers.length > 0) {
                user = existingUsers[0];
            } else {

                const roles = await strapi.entityService.findMany(
                    'plugin::users-permissions.role',
                    {
                        filters: { type: 'authenticated' },
                    }
                );

                const authenticatedRole = roles[0];

                user = await strapi.entityService.create(
                    'plugin::users-permissions.user',
                    {
                        data: {
                            username: email.split('@')[0],
                            email,
                            password: `supabase_${supabaseId}_${Date.now()}`,
                            confirmed: true,
                            blocked: false,
                            role: authenticatedRole.id,
                            supabaseId,
                            firstName: fullName || '',
                            lastName: '',
                            imageUrl: avatarUrl || '',
                        },
                    }
                );
            }

            // check subscription
            const existingSubscription = await strapi.entityService.findMany(
                'api::subscription.subscription',
                {
                    filters: { user: user.id },
                }
            );

            if (existingSubscription.length === 0) {
                await strapi.entityService.create(
                    'api::subscription.subscription',
                    {
                        data: {
                            user: user.id,
                            plan: 'free',
                            subscriptionStatus: 'active',
                            currentPeriodStart: new Date(),
                            currentPeriodEnd: null,
                            cancelAtPeriodEnd: false,
                        },
                    }
                );
            }

            // IMPORTANT: fetch user again with subscription
            const updatedUser = await strapi.entityService.findOne(
                'plugin::users-permissions.user',
                user.id,
                {
                    populate: ['subscription'],
                }
            ) as any;

            return {
                id: updatedUser.id,
                email: updatedUser.email,
                supabaseId: updatedUser.supabaseId,
                subscription: updatedUser.subscription || null,
            };

        } catch (error) {
            console.error(error);
            return ctx.internalServerError('Sync failed');
        }
    },
};