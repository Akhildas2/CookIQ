export default {
  routes: [
    // ── Public: pricing page ──────────────────────────────────────────────────
    {
      method: 'GET',
      path: '/billing/plans',
      handler: 'billing.getPlans',
      config: { auth: false },
    },

    // ── Protected: get current user's subscription ────────────────────────────
    {
      method: 'GET',
      path: '/billing/my-subscription',
      handler: 'billing.mySubscription',
      config: {
        auth: false,
        middlewares: ['global::supabase-auth'],
      },
    },

    // ── Protected: subscribe for the first time ───────────────────────────────
    {
      method: 'POST',
      path: '/billing/create-subscription',
      handler: 'billing.createSubscription',
      config: {
        auth: false,
        middlewares: ['global::supabase-auth'],
      },
    },

    // ── Protected: upgrade or downgrade plan ──────────────────────────────────
    {
      method: 'POST',
      path: '/billing/change-plan',
      handler: 'billing.changePlan',
      config: {
        auth: false,
        middlewares: ['global::supabase-auth'],
      },
    },

    // ── Protected: cancel subscription ───────────────────────────────────────
    {
      method: 'POST',
      path: '/billing/cancel',
      handler: 'billing.cancelSubscription',
      config: {
        auth: false,
        middlewares: ['global::supabase-auth'],
      },
    },

    // ── Protected: sync subscription state after payment ─────────────────────
    // Called from frontend immediately after Razorpay handler fires.
    // Bypasses webhook dependency — works in localhost too.
    {
      method: 'POST',
      path: '/billing/sync-subscription',
      handler: 'billing.syncSubscription',
      config: {
        auth: false,
        middlewares: ['global::supabase-auth'],
      },
    },

    // ── Public: Razorpay webhook (Razorpay calls this, not your frontend) ─────
    {
      method: 'POST',
      path: '/billing/webhook',
      handler: 'billing.webhook',
      config: { auth: false },
    },
  ],
};