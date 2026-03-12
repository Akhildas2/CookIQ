import Razorpay from 'razorpay';
import crypto from 'crypto';
import { Context } from 'koa';

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID as string,
    key_secret: process.env.RAZORPAY_KEY_SECRET as string,
});

const POPULAR_PLAN = (process.env.RAZORPAY_POPULAR_PLAN ?? 'pro').toLowerCase();

// ─── Helper: convert Razorpay period string → billingCycle ──────────────────
function toBillingCycle(period: string): 'monthly' | 'yearly' | null {
    if (period === 'monthly') return 'monthly';
    if (period === 'yearly') return 'yearly';
    return null;
}

// ─── Helper: fetch billingCycle from Razorpay plan, fall back to notes ───────
// WHY centralised: every endpoint needs this — DRY prevents drift bugs.
async function fetchBillingCycle(
    planId: string,
    fallbackNotes?: Record<string, any>
): Promise<'monthly' | 'yearly' | null> {
    try {
        const rzpPlan: any = await razorpay.plans.fetch(planId);
        return toBillingCycle(rzpPlan.period);
    } catch {
        // Fallback: use whatever the frontend/webhook stored in notes
        const nc = fallbackNotes?.billingCycle;
        if (nc === 'yearly') return 'yearly';
        if (nc === 'monthly') return 'monthly';
        return null;
    }
}

// ─── Helper: find user by email ──────────────────────────────────────────────
async function findUserByEmail(email: string) {
    const users = await strapi.entityService.findMany(
        'plugin::users-permissions.user',
        { filters: { email } }
    );
    return users[0] || null;
}

// ─── Helper: find subscription by user id ────────────────────────────────────
async function findSubscriptionByUser(userId: string | number) {
    const subs = await strapi.entityService.findMany(
        'api::subscription.subscription',
        {
            filters: { user: { id: userId } },
            fields: [
                'id', 'plan', 'subscriptionStatus',
                'razorpaySubscriptionId', 'razorpayCustomerId',
                'currentPeriodStart', 'currentPeriodEnd',
                'cancelAtPeriodEnd', 'billingCycle',
            ],
        }
    );
    return subs[0] || null;
}

// ─── Helper: find subscription by razorpay subscription id ───────────────────
async function findSubscriptionByRazorpayId(razorpaySubId: string) {
    const subs = await strapi.entityService.findMany(
        'api::subscription.subscription',
        {
            filters: { razorpaySubscriptionId: razorpaySubId },
            populate: ['user'],
        }
    );
    return subs[0] || null;
}

// ─── Helper: upsert subscription record ──────────────────────────────────────
async function upsertSubscription(userId: string | number, data: Record<string, any>) {
    const existing = await findSubscriptionByUser(userId);
    if (existing) {
        return strapi.entityService.update(
            'api::subscription.subscription',
            existing.id,
            { data }
        );
    } else {
        return strapi.entityService.create(
            'api::subscription.subscription',
            { data: { user: userId, ...data } }
        );
    }
}

// ─── Helper: downgrade user to free ──────────────────────────────────────────
async function downgradeToFree(
    subId: string | number,
    status: 'cancelled' | 'expired' = 'cancelled'
) {
    return strapi.entityService.update(
        'api::subscription.subscription',
        subId,
        {
            data: {
                plan: 'free',
                subscriptionStatus: status,
                razorpaySubscriptionId: null,
                razorpayCustomerId: null,
                cancelAtPeriodEnd: false,
                currentPeriodStart: null,
                currentPeriodEnd: null,
                billingCycle: null,
            },
        }
    );
}

export default {

    // ============================================================
    // GET ALL RAZORPAY PLANS
    // GET /api/billing/plans  (public)
    // ============================================================
    async getPlans(ctx: Context) {
        try {
            const response = await razorpay.plans.all({ count: 100 });
            const grouped: Record<string, any> = {};

            response.items.forEach((plan: any) => {
                const name = plan.item.name.toLowerCase();
                const amount = plan.item.amount / 100;

                let baseName = '';
                if (name.includes('premium')) baseName = 'premium';
                else if (name.includes('pro')) baseName = 'pro';
                if (!baseName) return;

                if (!grouped[baseName]) {
                    grouped[baseName] = {
                        name: baseName,
                        description: plan.item.description || '',
                        isPopular: baseName === POPULAR_PLAN,
                        monthly: null,
                        yearly: null,
                    };
                }

                if (plan.period === 'monthly') {
                    grouped[baseName].monthly = { planId: plan.id, interval: 'month', amount };
                }
                if (plan.period === 'yearly') {
                    grouped[baseName].yearly = { planId: plan.id, interval: 'year', amount };
                }
            });

            const plans = Object.values(grouped).map((plan: any) => {
                if (plan.monthly && plan.yearly) {
                    const annualIfMonthly = plan.monthly.amount * 12;
                    const savingsPct = Math.round(
                        ((annualIfMonthly - plan.yearly.amount) / annualIfMonthly) * 100
                    );
                    plan.yearlySavingsPct = savingsPct > 0 ? savingsPct : 0;
                }
                return plan;
            });

            return ctx.send(plans);
        } catch (error) {
            console.error('RAZORPAY PLAN ERROR:', error);
            return ctx.internalServerError('Failed to fetch plans');
        }
    },

    // ============================================================
    // GET CURRENT USER SUBSCRIPTION
    // GET /api/billing/my-subscription  (protected)
    // ============================================================
    async mySubscription(ctx: Context) {
        const user = ctx.state.supabaseUser;
        if (!user) return ctx.unauthorized('Login required');

        try {
            const strapiUser = await findUserByEmail(user.email);
            if (!strapiUser) return ctx.send({ plan: 'free', subscriptionStatus: 'active', billingCycle: null });

            const sub = await findSubscriptionByUser(strapiUser.id);
            if (!sub) return ctx.send({ plan: 'free', subscriptionStatus: 'active', billingCycle: null });

            return ctx.send(sub);
        } catch (error) {
            return ctx.internalServerError('Failed to fetch subscription');
        }
    },

    // ============================================================
    // CREATE NEW SUBSCRIPTION (first time or after cancellation)
    // POST /api/billing/create-subscription  (protected)
    // ============================================================
    async createSubscription(ctx: Context) {
        const user = ctx.state.supabaseUser;
        if (!user) return ctx.unauthorized('Login required');

        const { planId, planName, billingCycle: billingCycleInput } = ctx.request.body;
        if (!planId) return ctx.badRequest('Plan ID required');

        const allowedPlans = ['pro', 'premium'];
        if (!allowedPlans.includes(planName)) return ctx.badRequest('Invalid plan');

        try {
            const billingCycle = await fetchBillingCycle(planId, { billingCycle: billingCycleInput });

            // Cancel any existing active/authenticated sub before creating a new one
            const strapiUser = await findUserByEmail(user.email);
            if (strapiUser) {
                const existingSub = await findSubscriptionByUser(strapiUser.id);
                if (
                    existingSub?.razorpaySubscriptionId &&
                    ['active', 'authenticated', 'pending'].includes(existingSub.subscriptionStatus as string)
                ) {
                    try {
                        await razorpay.subscriptions.cancel(existingSub.razorpaySubscriptionId, false);
                    } catch (cancelErr) {
                        strapi.log.warn(`createSubscription: cancel old sub failed (continuing): ${cancelErr}`);
                    }
                }
            }

            const subscription = await razorpay.subscriptions.create({
                plan_id: planId,
                customer_notify: 1,
                total_count: 120,
                notes: {
                    userEmail: user.email,
                    plan: planName,
                    billingCycle: billingCycle ?? billingCycleInput ?? '',
                },
            });

            return ctx.send({
                subscriptionId: subscription.id,
                key: process.env.RAZORPAY_KEY_ID,
                billingCycle,
            });

        } catch (error: any) {
            console.error('SUBSCRIPTION ERROR:', error);
            return ctx.internalServerError('Subscription creation failed');
        }
    },

    // ============================================================
    // CHANGE PLAN (Upgrade / Downgrade)
    // POST /api/billing/change-plan  (protected)
    // ============================================================
    async changePlan(ctx: Context) {
        const user = ctx.state.supabaseUser;
        if (!user) return ctx.unauthorized('Login required');

        const { planId, planName, changeType, billingCycle: billingCycleInput } = ctx.request.body;
        if (!planId || !changeType) return ctx.badRequest('planId and changeType required');

        const allowedPlans = ['pro', 'premium'];
        if (!allowedPlans.includes(planName)) return ctx.badRequest('Invalid plan');
        if (!['upgrade', 'downgrade'].includes(changeType)) return ctx.badRequest('Invalid changeType');

        try {
            const billingCycle = await fetchBillingCycle(planId, { billingCycle: billingCycleInput });

            const strapiUser = await findUserByEmail(user.email);
            if (!strapiUser) return ctx.notFound('User not found');

            const currentSub = await findSubscriptionByUser(strapiUser.id);
            const changeableStatuses = ['active', 'pending', 'authenticated', 'halted'];

            if (!currentSub || !changeableStatuses.includes(currentSub.subscriptionStatus as string)) {
                return ctx.badRequest('No active subscription to change');
            }

            // Cancel current sub immediately (both upgrade and downgrade)
            if (currentSub.razorpaySubscriptionId) {
                try {
                    await razorpay.subscriptions.cancel(currentSub.razorpaySubscriptionId, false);
                } catch (cancelErr) {
                    strapi.log.warn(`changePlan: cancel old sub failed (continuing): ${cancelErr}`);
                }
            }

            // Create new subscription for target plan
            const newSub = await razorpay.subscriptions.create({
                plan_id: planId,
                customer_notify: 1,
                total_count: 120,
                notes: {
                    userEmail: user.email,
                    plan: planName,
                    billingCycle: billingCycle ?? '',
                },
            });

            // while user completes the Razorpay checkout flow.
            await upsertSubscription(strapiUser.id, {
                razorpaySubscriptionId: newSub.id,
                plan: planName,
                subscriptionStatus: 'pending',
                cancelAtPeriodEnd: false,
                currentPeriodStart: null,
                currentPeriodEnd: null,
                billingCycle,
            });

            return ctx.send({
                subscriptionId: newSub.id,
                key: process.env.RAZORPAY_KEY_ID,
                billingCycle,
                message: `${changeType === 'upgrade' ? 'Upgrade' : 'Downgrade'} initiated — complete payment to activate`,
            });

        } catch (error) {
            console.error('CHANGE PLAN ERROR:', error);
            return ctx.internalServerError('Plan change failed');
        }
    },

    // ============================================================
    // CANCEL SUBSCRIPTION
    // POST /api/billing/cancel  (protected)
    // ============================================================
    async cancelSubscription(ctx: Context) {
        const user = ctx.state.supabaseUser;
        if (!user) return ctx.unauthorized('Login required');

        const { immediately = false } = ctx.request.body;

        try {
            const strapiUser = await findUserByEmail(user.email);
            if (!strapiUser) return ctx.notFound('User not found');

            const currentSub = await findSubscriptionByUser(strapiUser.id);
            const cancelableStatuses = ['active', 'pending', 'authenticated', 'halted'];

            if (!currentSub || !cancelableStatuses.includes(currentSub.subscriptionStatus as string)) {
                return ctx.badRequest('No active subscription to cancel');
            }

            // No Razorpay sub on record — just wipe locally
            if (!currentSub.razorpaySubscriptionId) {
                await downgradeToFree(currentSub.id);
                return ctx.send({ message: 'Subscription cancelled' });
            }

            if (immediately) {
                await razorpay.subscriptions.cancel(currentSub.razorpaySubscriptionId, false);
                await downgradeToFree(currentSub.id, 'cancelled');
                return ctx.send({ message: 'Subscription cancelled immediately' });

            } else {
                // Cancel at end of billing period — user keeps access until then
                await razorpay.subscriptions.cancel(currentSub.razorpaySubscriptionId, true);
                await strapi.entityService.update(
                    'api::subscription.subscription',
                    currentSub.id,
                    {
                        data: {
                            subscriptionStatus: 'active',
                            cancelAtPeriodEnd: true
                        },
                    }
                );

                const endDate = currentSub.currentPeriodEnd
                    ? new Date(currentSub.currentPeriodEnd).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                    })
                    : 'the end of the billing period';

                return ctx.send({
                    message: `Your plan will remain active until ${endDate}`,
                    effectiveDate: currentSub.currentPeriodEnd,
                });
            }

        } catch (error) {
            console.error('CANCEL ERROR:', error);
            return ctx.internalServerError('Cancellation failed');
        }
    },

    // ============================================================
    // SYNC SUBSCRIPTION AFTER PAYMENT
    // POST /api/billing/sync-subscription  (protected)
    // ============================================================
    async syncSubscription(ctx: Context) {
        const user = ctx.state.supabaseUser;
        if (!user) return ctx.unauthorized('Login required');

        const { razorpaySubscriptionId } = ctx.request.body;
        if (!razorpaySubscriptionId) return ctx.badRequest('razorpaySubscriptionId required');

        try {
            const rzpSub: any = await razorpay.subscriptions.fetch(razorpaySubscriptionId);

            // Razorpay charges the first invoice async — by the time the user lands on
            // the success page, paid_count is usually already 1.
            let subscriptionStatus: string;
            if (rzpSub.status === 'authenticated' && (rzpSub.paid_count ?? 0) > 0) {
                subscriptionStatus = 'active';
            } else {
                const statusMap: Record<string, string> = {
                    created: 'pending',
                    authenticated: 'pending',   // no payment yet
                    active: 'active',
                    pending: 'pending',
                    halted: 'halted',
                    cancelled: 'cancelled',
                    completed: 'expired',
                    expired: 'expired',
                };
                subscriptionStatus = statusMap[rzpSub.status] ?? 'pending';
            }

            const planName = rzpSub.notes?.plan ?? null;
            const currentPeriodStart = rzpSub.current_start ? new Date(rzpSub.current_start * 1000) : null;
            const currentPeriodEnd = rzpSub.current_end ? new Date(rzpSub.current_end * 1000) : null;
            const billingCycle = await fetchBillingCycle(rzpSub.plan_id, rzpSub.notes);

            const strapiUser = await findUserByEmail(user.email);
            if (!strapiUser) return ctx.notFound('User not found in DB');

            const cancelAtPeriodEnd = rzpSub.cancel_at_cycle_end === true && rzpSub.status === 'active';

            await upsertSubscription(strapiUser.id, {
                razorpaySubscriptionId: rzpSub.id,
                razorpayCustomerId: rzpSub.customer_id ?? null,
                plan: planName,
                subscriptionStatus,
                cancelAtPeriodEnd,
                currentPeriodStart,
                currentPeriodEnd,
                billingCycle,
            });

            strapi.log.info(
                `syncSubscription: ${rzpSub.id} → ${subscriptionStatus} (${planName}, ${billingCycle})`
            );

            return ctx.send({ synced: true, status: subscriptionStatus, plan: planName, billingCycle });

        } catch (error) {
            console.error('SYNC SUBSCRIPTION ERROR:', error);
            return ctx.internalServerError('Failed to sync subscription');
        }
    },

    // ============================================================
    // RAZORPAY WEBHOOK
    // POST /api/billing/webhook  (public — Razorpay calls this)
    // ============================================================
    async webhook(ctx: Context) {
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET as string;
        const signature = ctx.request.headers['x-razorpay-signature'] as string;
        const rawBody = ctx.request.body[Symbol.for('unparsedBody')];

        const expectedSignature = crypto
            .createHmac('sha256', webhookSecret)
            .update(rawBody)
            .digest('hex');

        if (expectedSignature !== signature) {
            strapi.log.warn('Invalid Razorpay webhook signature');
            return ctx.badRequest('Invalid signature');
        }

        const { event, payload } = ctx.request.body;
        const subscription = payload?.subscription?.entity;

        strapi.log.info(`Razorpay Webhook: ${event}`);

        try {
            switch (event) {

                // ── First payment collected; subscription becomes active ────────
                case 'subscription.activated': {
                    const userEmail = subscription.notes?.userEmail;
                    if (!userEmail) break;

                    const strapiUser = await findUserByEmail(userEmail);
                    if (!strapiUser) break;

                    const billingCycle = await fetchBillingCycle(subscription.plan_id, subscription.notes);

                    await upsertSubscription(strapiUser.id, {
                        razorpaySubscriptionId: subscription.id,
                        razorpayCustomerId: subscription.customer_id ?? null,
                        plan: subscription.notes?.plan,
                        subscriptionStatus: 'active',
                        cancelAtPeriodEnd: false,
                        currentPeriodStart: new Date(subscription.current_start * 1000),
                        currentPeriodEnd: new Date(subscription.current_end * 1000),
                        billingCycle,
                    });

                    strapi.log.info(`Subscription activated for ${userEmail} (${billingCycle})`);
                    break;
                }

                // ── Recurring charge succeeded; refresh period dates ───────────
                case 'subscription.charged': {
                    const sub = await findSubscriptionByRazorpayId(subscription.id);
                    if (!sub) break;

                    const billingCycle = await fetchBillingCycle(subscription.plan_id, subscription.notes);

                    await strapi.entityService.update(
                        'api::subscription.subscription',
                        sub.id,
                        {
                            data: {
                                subscriptionStatus: 'active',
                                razorpayCustomerId: subscription.customer_id ?? null,
                                currentPeriodStart: new Date(subscription.current_start * 1000),
                                currentPeriodEnd: new Date(subscription.current_end * 1000),
                                cancelAtPeriodEnd: false,
                                billingCycle,
                            },
                        }
                    );

                    strapi.log.info(`Subscription renewed: ${subscription.id} (${billingCycle})`);
                    break;
                }

                // ── Subscription cancelled (period end reached or immediate) ───
                case 'subscription.cancelled': {
                    const sub = await findSubscriptionByRazorpayId(subscription.id);
                    if (!sub) break;

                    await downgradeToFree(sub.id, 'cancelled');
                    strapi.log.info(`Subscription cancelled → downgraded to free: ${subscription.id}`);
                    break;
                }

                // ── All billing cycles exhausted ───────────────────────────────
                case 'subscription.completed': {
                    const sub = await findSubscriptionByRazorpayId(subscription.id);
                    if (!sub) break;

                    await downgradeToFree(sub.id, 'expired');
                    strapi.log.info(`Subscription completed → expired: ${subscription.id}`);
                    break;
                }

                // ── Payment failed after all retries ───────────────────────────
                case 'subscription.halted': {
                    const sub = await findSubscriptionByRazorpayId(subscription.id);
                    if (!sub) break;

                    await strapi.entityService.update(
                        'api::subscription.subscription',
                        sub.id,
                        { data: { subscriptionStatus: 'halted' } }
                    );

                    strapi.log.warn(`Subscription halted (payment failed): ${subscription.id}`);
                    break;
                }

                default:
                    strapi.log.info(`Unhandled Razorpay event: ${event}`);
            }
        } catch (error) {
            strapi.log.error(`Webhook processing error for ${event}:`, error);
        }

        return ctx.send({ received: true });
    },
};