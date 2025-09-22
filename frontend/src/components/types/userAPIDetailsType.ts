export interface UserAPIDetailsType {
    login: string;
    timezone: string;
    rates: {
        limits: Record<string, unknown>;
        statistics: Record<string, unknown>;
    };
    money: {
        total: number;
        balance: number;
        limits: Record<string, unknown>;
    };
    price: {
        keywords_data: Record<string, unknown>;
        merchant: Record<string, unknown>;
        serp: Record<string, unknown>;
    };
    backlinks_subscription_expiry_date: string | null;
}
