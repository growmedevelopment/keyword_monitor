// Responsibility: Parse the raw string into an array
export const parseRawInput = (input: string): string[] => {
    return input
        .split('\n')
        .map((url) => url.trim())
        .filter((url) => url.length > 0);
};

// Responsibility: specific logic to check if ONE url is valid
export const isValidUrl = (url: string): boolean => {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};

// Responsibility: Filter a list and identify invalid items
// Returns an object separating good vs bad data
export const validateUrlList = (urls: string[]) => {
    const valid: string[] = [];
    const invalid: string[] = [];

    urls.forEach((url) => {
        if (isValidUrl(url)) {
            valid.push(url);
        } else {
            invalid.push(url);
        }
    });

    return { valid, invalid };
};

// Responsibility: Remove duplicates and returns unique URLs and errors
export const getUniqueUrls = (urls: string[]) => {
    const seen = new Set<string>();
    const duplicates = new Set<string>();
    const cleanUrls: string[] = [];

    for (const url of urls) {
        if (seen.has(url)) {
            // We found a duplicate!
            duplicates.add(url);
        } else {
            // First time seeing this URL
            seen.add(url);
            cleanUrls.push(url);
        }
    }

    return {
        urls: cleanUrls,
        // Convert the Set of duplicates back to an array
        errors: Array.from(duplicates)
    };
};


