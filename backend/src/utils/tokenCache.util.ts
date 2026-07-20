import NodeCache from "node-cache";
import crypto from "crypto";

const tokenCache = new NodeCache({ stdTTL: 900, checkperiod: 60});

export const createAndStoreToken = (
    tokenType: "reset" | "verify", 
    userId: number, 
    customTTL?: number,
): string => {
    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    const cacheKey = `${tokenType}:${hashedToken}`;

    if (customTTL) {
        tokenCache.set(cacheKey, userId.toString(), customTTL);
    } else {
        tokenCache.set(cacheKey, userId.toString());
    }

    return rawToken;
};

export const consumeToken = (
    tokenType: "reset" | "verify",
    rawToken: string,
): number | null => {
    if (!rawToken) return null;

    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    const cacheKey = `${tokenType}:${hashedToken}`;

    const userId = tokenCache.get(cacheKey) as string;
    if (userId) {
        tokenCache.del(cacheKey);
        return parseInt(userId);
    }
    return null;
};