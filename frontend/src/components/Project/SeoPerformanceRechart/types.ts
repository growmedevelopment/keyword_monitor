import { Dayjs } from "dayjs";

export type KeywordPoint = {
    rank_group: number;
    tracked_at: string;
};

export type KeywordWithResults = {
    id: number;
    keyword: string;
    results: KeywordPoint[];
};

export type SeoMetrics = {
    average_position: number;
    chart_data: { date: string; avg_position: number }[];
    tracked_keywords: number;
};

export type ComponentProps = {
    keywords: KeywordWithResults[];
    datePeriod: [Dayjs, Dayjs];
    setDateRangeFunction?: (range: [Dayjs, Dayjs]) => void;
};