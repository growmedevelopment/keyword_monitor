import dayjs, { Dayjs } from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

import type { SeoMetrics } from "./types";
import type {Keyword} from "../../types/keywordTypes.ts";

export const filterResultsByRange = (
    keywords: Keyword[],
    [start, end]: [Dayjs, Dayjs],
    mode: "range" | "compare" | "latest" = "range"
) => {
    return keywords.map((kw) => {
        const sourceResults = kw.results ?? kw.keywords_rank ?? [];

        if (mode === "latest") {
            return {
                ...kw,
                results: sourceResults.slice(0, 2),
            };
        }

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

export const buildMetrics = (keywords: Keyword[]): SeoMetrics => {
    const chartMap: Record<string, number[]> = {};
    const allRanks: number[] = [];

    keywords.forEach((kw) => {
        // Fallback: use keywords_rank if results missing
        const results = kw.results ?? kw.keywords_rank ?? [];
        results.forEach((r) => {
            const dateISO = dayjs(r.tracked_at).format("YYYY-MM-DD");

            if (!chartMap[dateISO]) chartMap[dateISO] = [];

            chartMap[dateISO].push(r.position);
            allRanks.push(r.position);
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