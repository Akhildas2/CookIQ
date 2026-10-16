/**
 * pantry-item controller
 */

import { factories } from '@strapi/strapi';
import fs from 'fs';
import { getCurrentUser, isProUser } from '../../../utils/user';
import { checkLimit } from '../../../utils/arcjet';
import { generateJson } from '../../../utils/gemini';

const UID = 'api::pantry-item.pantry-item';
const CATEGORIES = ['Vegetables', 'Fruits', 'Dairy', 'Proteins', 'Grains', 'Spices', 'Other'];
const UNITS = ['pieces', 'kg', 'g', 'litre', 'ml', 'bunch', 'pack', 'bottle', 'bulb'];

const toDto = (i: any) => ({
    id: i.documentId,
    name: i.name,
    quantity: Number(i.quantity),
    unit: i.unit,
    category: i.category,
    emoji: i.emoji || '🥣',
    expiryDate: i.expiryDate ?? null,
    updatedAt: i.updatedAt,
});

function clean(b: any) {
    const name = String(b?.name ?? '').trim().slice(0, 80);
    const quantity = Number(b?.quantity);
    if (!name || !Number.isFinite(quantity) || quantity <= 0) return null;
    return {
        name,
        quantity,
        unit: UNITS.includes(b?.unit) ? b.unit : 'pieces',
        category: CATEGORIES.includes(b?.category) ? b.category : 'Other',
        emoji: String(b?.emoji || '🥣').slice(0, 8),
        expiryDate: /^\d{4}-\d{2}-\d{2}$/.test(b?.expiryDate ?? '') ? b.expiryDate : null,
    };
}

const findOwned = (documentId: string, userId: number) =>
    strapi.documents(UID).findFirst({ filters: { documentId, owner: { id: userId } } });

export default factories.createCoreController(UID, () => ({
    async list(ctx) {
        const user = await getCurrentUser(ctx);
        if (!user) return ctx.unauthorized('Login required');

        const items = await strapi.documents(UID).findMany({
            filters: { owner: { id: user.id } },
            sort: 'createdAt:desc',
            limit: 500,
        });
        return { items: items.map(toDto) };
    },

    async create(ctx) {
        const user = await getCurrentUser(ctx);
        if (!user) return ctx.unauthorized('Login required');

        const data = clean(ctx.request.body);
        if (!data) return ctx.badRequest('Valid name and quantity required');

        const item = await strapi.documents(UID).create({
            data: { ...data, owner: user.documentId },
        });
        return toDto(item);
    },

    async bulkCreate(ctx) {
        const user = await getCurrentUser(ctx);
        if (!user) return ctx.unauthorized('Login required');

        const list = Array.isArray(ctx.request.body?.items) ? ctx.request.body.items : [];
        const cleaned = list.map(clean).filter(Boolean).slice(0, 30);
        if (!cleaned.length) return ctx.badRequest('No valid items');

        const created: any[] = [];
        for (const data of cleaned) {
            const item = await strapi.documents(UID).create({
                data: { ...data, owner: user.documentId },
            });
            created.push(toDto(item));
        }
        return { items: created };
    },

    async update(ctx) {
        const user = await getCurrentUser(ctx);
        if (!user) return ctx.unauthorized('Login required');

        const owned = await findOwned(ctx.params.id, user.id);
        if (!owned) return ctx.notFound('Item not found');

        const data = clean(ctx.request.body);
        if (!data) return ctx.badRequest('Valid name and quantity required');

        const item = await strapi.documents(UID).update({ documentId: owned.documentId, data });
        return toDto(item);
    },

    async remove(ctx) {
        const user = await getCurrentUser(ctx);
        if (!user) return ctx.unauthorized('Login required');

        const owned = await findOwned(ctx.params.id, user.id);
        if (!owned) return ctx.notFound('Item not found');

        await strapi.documents(UID).delete({ documentId: owned.documentId });
        return { deleted: true };
    },

    // POST /pantry/scan  (multipart, field name: "image")
    async scan(ctx) {
        const user = await getCurrentUser(ctx);
        if (!user) return ctx.unauthorized('Login required');

        const raw = (ctx.request.files as any)?.image;
        const file = Array.isArray(raw) ? raw[0] : raw;
        if (!file) return ctx.badRequest('Image is required');
        if (!String(file.mimetype).startsWith('image/')) return ctx.badRequest('File must be an image');
        if (file.size > 10 * 1024 * 1024) return ctx.badRequest('Image must be under 10 MB');

        const isPro = await isProUser(user.id);
        const limit = await checkLimit(ctx, 'scan', user.id, isPro);
        if (!limit.allowed) {
            return ctx.tooManyRequests(
                isPro ? 'Scan limit reached. Try again later.' : 'Monthly scan limit reached. Upgrade to Pro for more scans.'
            );
        }

        const base64 = await fs.promises.readFile(file.filepath, { encoding: 'base64' });

        const prompt = `You are a food ingredient recognition expert. Identify all visible food ingredients in this fridge/pantry photo.
Return a JSON array (max 20 items), each item exactly:
{"name": string, "quantity": number, "unit": one of ${JSON.stringify(UNITS)}, "category": one of ${JSON.stringify(CATEGORIES)}, "emoji": single emoji, "confidence": number 0.7-1}
Rules: only food (no containers), be specific ("Cheddar cheese" not "cheese"), estimate realistic quantities, omit items under 0.7 confidence.`;

        const result = await generateJson<any>([
            { inlineData: { mimeType: file.mimetype, data: base64 } },
            { text: prompt },
        ]);

        const arr = Array.isArray(result) ? result : result?.ingredients;
        const ingredients = (Array.isArray(arr) ? arr : [])
            .map((i: any) => {
                const c = clean(i);
                return c ? { ...c, confidence: Number(i.confidence) || 0.8 } : null;
            })
            .filter(Boolean)
            .slice(0, 20);

        if (!ingredients.length) return ctx.badRequest('No ingredients detected. Try a clearer photo.');

        return { ingredients, scansRemaining: isPro ? null : limit.remaining ?? null };
    },
}));