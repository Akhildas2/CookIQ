const MODEL = process.env.GEMINI_MODEL || 'gemini-3.8-flash';

export async function generateJson<T = any>(parts: any[]): Promise<T> {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        throw new Error('GEMINI_API_KEY is not configured');
    }

    // Dynamically import the ESM-only SDK for CommonJS compatibility.
    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey });

    let res: any;

    for (let attempt = 0; attempt < 3; attempt++) {
        try {
            res = await ai.models.generateContent({
                model: MODEL,
                contents: [{ role: 'user', parts }],
                config: {
                    responseMimeType: 'application/json',
                },
            });

            break;
        } catch (error: unknown) {
            const message =
                error instanceof Error ? error.message : String(error);

            const retryable =
                /503|UNAVAILABLE|429|RESOURCE_EXHAUSTED|500|502|504|INTERNAL|high demand/i
                    .test(message);

            if (!retryable || attempt === 2) {
                strapi.log.error(`Gemini request failed: ${message}`);
                throw error;
            }

            const delay = 1000 * 2 ** attempt;

            strapi.log.warn(
                `Gemini temporarily unavailable. Retrying in ${delay}ms.`
            );

            await new Promise((resolve) => setTimeout(resolve, delay));
        }
    }

    const text = (res.text ?? '')
        .replace(/```json|```/g, '')
        .trim();

    try {
        return JSON.parse(text) as T;
    } catch {
        strapi.log.error(`Gemini invalid JSON: ${text.slice(0, 300)}`);
        throw new Error('AI returned an invalid response. Please try again.');
    }
}