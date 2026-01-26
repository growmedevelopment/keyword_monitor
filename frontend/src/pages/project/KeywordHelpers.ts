export const parseRawKeywords = (input: string): string[] => {
    return input
        // Split by newline or comma (common for keyword lists)
        .split(/[\n,]+/)
        .map((k) => k.trim())
        .filter((k) => k.length > 0);
};

export const validateKeywordList = (keywords: string[]) => {
    const valid: string[] = [];
    const invalid: string[] = [];

    keywords.forEach((k) => {
        // Validation Rules:
        // 1. Must be at least 2 characters
        // 2. Must be under 100 characters (adjust as needed for your DB)
        if (k.length >= 2 && k.length <= 100) {
            valid.push(k);
        } else {
            invalid.push(k);
        }
    });

    return { valid, invalid };
};

export const getUniqueKeywords = (keywords: string[]) => {
    const seen = new Set<string>();
    const duplicates = new Set<string>();
    const cleanKeywords: string[] = [];

    for (const k of keywords) {
        // Case-insensitive duplicate check (optional, but recommended for keywords)
        const lowerK = k.toLowerCase();

        if (seen.has(lowerK)) {
            duplicates.add(k);
        } else {
            seen.add(lowerK);
            cleanKeywords.push(k);
        }
    }

    return {
        keywords: cleanKeywords,
        errors: Array.from(duplicates)
    };
};