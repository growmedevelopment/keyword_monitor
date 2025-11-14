import { Dayjs } from "dayjs";
import type {Keyword} from "../../types/keywordTypes.ts";

export type KeywordPoint = {
    rank_group: number;
    tracked_at: string;
};

export type KeywordWithResults = {
    id: number;
    keyword: string;
    keyword_group_color: string;
    keyword_group_id: string;
    results: KeywordPoint[];
};

export type SeoMetrics = {
    average_position: number;
    chart_data: { date: string; avg_position: number }[];
    tracked_keywords: number;
};

export type ComponentProps = {
    keywords: Keyword[];
    datePeriod: [Dayjs, Dayjs];
    setDateRangeFunction?: (range: [Dayjs, Dayjs], mode: "range" | "compare") => void;
};