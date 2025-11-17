import dayjs, { Dayjs } from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

import type { SeoMetrics } from "./types";
import type {Keyword, KeywordGroup, KeywordRank, KeywordResult} from "../../types/keywordTypes.ts";

export const filterResultsByRange = (
    keywords: Keyword[],
    [start, end]: [Dayjs, Dayjs]
) => {
    return keywords.map((kw) => {
        const sourceResults = kw.results ?? kw.keywords_rank ?? [];

        const filtered = sourceResults.filter((r) => {
            const t = dayjs(r.tracked_at);
            return t.isSameOrAfter(start, "day") && t.isSameOrBefore(end, "day");
        });

        return {
            ...kw,
            results: filtered, // normalized output
        };
    });
};

export const buildMetrics = (keywords: {
    id: number;
    keyword: string;
    status_code: number;
    status_message: string;
    project_id: number;
    results: KeywordResult[];
    keywords_rank: KeywordRank[];
    keyword_groups: KeywordGroup;
    keyword_group_id: KeywordGroup["id"] | null;
    keyword_group_name: KeywordGroup["name"] | null;
    keyword_group_color: KeywordGroup["color"] | null
}[]): SeoMetrics => {
    const chartMap: Record<string, number[]> = {};
    const allRanks: number[] = [];

    keywords.forEach((kw) => {
        // Fallback: use keywords_rank if results missing
        const results = kw.results ?? kw.keywords_rank ?? [];
        results.forEach((r) => {
            const dateISO = dayjs(r.tracked_at).format("YYYY-MM-DD");

            if (!chartMap[dateISO]) chartMap[dateISO] = [];

            chartMap[dateISO].push(r.rank_group);
            allRanks.push(r.rank_group);
        });
    });

    const chart_data = Object.entries(chartMap)
        .sort(([a], [b]) => dayjs(a).valueOf() - dayjs(b).valueOf())
        .map(([dateISO, arr]) => ({
            date: dayjs(dateISO).format("MMM D"),
            avg_position: Math.round(arr.reduce((s, v) => s + v, 0) / arr.length),
        }));

    const average_position =
        allRanks.length > 0
            ? parseFloat((allRanks.reduce((s, v) => s + v, 0) / allRanks.length).toFixed(1))
            : 0;

    return {
        average_position,
        chart_data,
        tracked_keywords: keywords.filter((k) => k.results.length > 0).length,
    };
};