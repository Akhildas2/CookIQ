
type Feature = 'scan' | 'recipe';

type LimiterSet = {
    scan: {
        free: any;
        pro: any;
    };
    recipe: {
        free: any;
        pro: any;
    };
};

let limitersPromise: Promise<LimiterSet> | undefined;

function getLimiters(): Promise<LimiterSet> {
    if (!limitersPromise) {
        limitersPromise = (async () => {
            const { default: arcjet, tokenBucket } =
                await import('@arcjet/node');

            const key = process.env.ARCJET_KEY;

            if (!key) {
                throw new Error('ARCJET_KEY is not configured');
            }

            const make = (
                refillRate: number,
                interval: string,
                capacity: number,
            ) =>
                arcjet({
                    key,
                    characteristics: ['userId'],
                    rules: [
                        tokenBucket({
                            mode: 'LIVE',
                            refillRate,
                            interval: interval as any,
                            capacity,
                        }),
                    ],
                });

            return {
                scan: {
                    free: make(10, '30d', 10),
                    pro: make(500, '1d', 500),
                },
                recipe: {
                    free: make(5, '30d', 5),
                    pro: make(1000, '1d', 1000),
                },
            };
        })().catch((error) => {
            // Allow a later request to retry initialization.
            limitersPromise = undefined;
            throw error;
        });
    }

    return limitersPromise;
}

export async function checkLimit(
    ctx: any,
    feature: Feature,
    userId: number,
    isPro: boolean,
): Promise<{ allowed: boolean; remaining?: number }> {
    try {
        const limiters = await getLimiters();

        const limiter = limiters[feature][isPro ? 'pro' : 'free'];

        const decision = await limiter.protect(ctx.req, {
            userId: String(userId),
            requested: 1,
        });

        if (decision.isDenied()) {
            return { allowed: false };
        }

        const remaining = decision.reason.isRateLimit()
            ? (decision.reason as any).remaining
            : undefined;

        return { allowed: true, remaining };
    } catch (err) {
        strapi.log.warn(`Arcjet error (allowing request): ${err}`);
        return { allowed: true };
    }
}
