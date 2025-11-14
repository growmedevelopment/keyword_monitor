import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import type { Keyword } from "../../types/keywordTypes";

dayjs.extend(utc);
dayjs.extend(timezone);

export const timezoneLabel = "America/Edmonton";

export type Result = { rank_group: number; url: string; tracked_at: string };

export function getResultsArray(k: Keyword): Result[] {
    const r = (k as any).results;
    return Array.isArray(r) ? r : r ? [r] : [];
}

export function getGroupByDate(k: Keyword): Record<string, Result> {
    return getResultsArray(k).reduce((acc, result) => {
        const key = dayjs.tz(result.tracked_at, timezoneLabel).format("YYYY-MM-DD");

        // keep the latest of the day
        if (!acc[key] || dayjs(result.tracked_at).isAfter(acc[key].tracked_at)) {
            acc[key] = result;
        }

        return acc;
    }, {} as Record<string, Result>);
}

export function getNumericPosition(data: Keyword, index: number): number | string {
    const dates = getSortedDates(data);
    const dateKey = dates[index];
    if (!dateKey) return "-";

    const rank = getGroupByDate(data)[dateKey]?.rank_group;
    if (rank === 0) return 101;
    return typeof rank === "number" ? rank : "-";
}

export function getSortedDates(data: Keyword): string[] {
    return Object.keys(getGroupByDate(data)).sort();
}

export function getUrlForToday(data: Keyword): string | undefined {
    const grouped = getGroupByDate(data);
    return grouped[getSortedDates(data).at(-1) ?? ""]?.url;
}