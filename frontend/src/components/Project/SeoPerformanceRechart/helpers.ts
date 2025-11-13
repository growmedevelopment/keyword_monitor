import dayjs, { Dayjs } from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

import type { KeywordWithResults, SeoMetrics } from "./types";

export const filterResultsByRange = (
    keywords: KeywordWithResults[],
    [start, end]: [Dayjs, Dayjs]
) => {
    return keywords.map((kw) => ({
        ...kw,
        results: kw.results.filter((r) => {
            const t = dayjs(r.tracked_at);
            return t.isSameOrAfter(start, "day") && t.isSameOrBefore(end, "day");
        }),
    }));
};

export const buildMetrics = (keywords: KeywordWithResults[]): SeoMetrics => {
    const chartMap: Record<string, number[]> = {};
    const allRanks: number[] = [];

    keywords.forEach((kw) => {
        kw.results.forEach((r) => {
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