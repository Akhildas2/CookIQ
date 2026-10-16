export default {
    async sync(ctx) {
        let step = 'starting sync';

        try {
            const { supabaseId, email, fullName, avatarUrl } =
                ctx.request.body;

            if (!supabaseId || !email) {
                return ctx.badRequest('Missing required fields');
            }

            const normalizedEmail = email.trim().toLowerCase();

            // 1. Find the user by their Supabase ID.
            step = 'finding existing user';

            const usersBySupabaseId = await strapi.entityService.findMany(
                'plugin::users-permissions.user',
                {
                    filters: { supabaseId },
                    populate: ['subscription'],
                }
            );

            let user = usersBySupabaseId[0];

            // 2. If not found, check whether the email already exists.
            if (!user) {
                step = 'checking existing email';

                const usersByEmail = await strapi.entityService.findMany(
                    'plugin::users-permissions.user',
                    {
                        filters: { email: normalizedEmail },
                    }
                );

                const emailUser = usersByEmail[0];

                if (emailUser) {
                    // Do not link an account already assigned to another
                    // Supabase identity.
                    if (
                        emailUser.supabaseId &&
                        emailUser.supabaseId !== supabaseId
                    ) {
                        return ctx.conflict(
                            'This email is already linked to another account.'
                        );
                    }

                    // Link only if your middleware has verified that the
                    // authenticated Supabase user owns this email.
                    step = 'linking existing email account';

                    user = await strapi.entityService.update(
                        'plugin::users-permissions.user',
                        emailUser.id,
                        {
                            data: {
                                supabaseId,
                                firstName: fullName || emailUser.firstName || '',
                                imageUrl: avatarUrl || emailUser.imageUrl || '',
                            },
                        }
                    );
                }
            }

            // 3. Create a new Strapi user if no matching user exists.
            if (!user) {
                step = 'finding authenticated role';

                const roles = await strapi.entityService.findMany(
                    'plugin::users-permissions.role',
                    {
                        filters: { type: 'authenticated' },
                    }
                );

                const authenticatedRole = roles[0];

                if (!authenticatedRole) {
                    throw new Error('Authenticated role not found');
                }

                // Use Supabase ID instead of the email prefix.
                const baseUsername = (
                    fullName?.trim() || normalizedEmail.split('@')[0]
                ).toLowerCase()
                    .replace(/[^a-z0-9]/g, '');

                const uniqueUsername = `${baseUsername}_${supabaseId
                    .replace(/-/g, '')
                    .slice(0, 8)}`;

                step = 'creating Strapi user';

                user = await strapi.entityService.create(
                    'plugin::users-permissions.user',
                    {
                        data: {
                            username: uniqueUsername,
                            email: normalizedEmail,
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

            // 4. Find or create the user's subscription.
            step = 'checking subscription';

            const existingSubscriptions =
                await strapi.entityService.findMany(
                    'api::subscription.subscription',
                    {
                        filters: {
                            user: {
                                id: {
                                    $eq: user.id,
                                },
                            },
                        },
                    }
                );

            if (existingSubscriptions.length === 0) {
                step = 'creating free subscription';

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

            // 5. Return the user with their subscription.
            step = 'fetching synced user';

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
        } catch (error: any) {
            console.error('User sync failed at:', step);
            console.dir(error?.details, { depth: null });
            console.error(error);

            return ctx.internalServerError(
                `User sync failed at: ${step}`
            );
        }
    },
};
