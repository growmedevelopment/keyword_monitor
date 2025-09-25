import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import type { Keyword } from "../../types/keywordTypes";

dayjs.extend(utc);
dayjs.extend(timezone);

export const timezoneLabel = "America/Edmonton";

export type Result = { rank_group: number; url: string; tracked_at: string };

export function getResultsArray(k: Keyword): Result[] {
    const r = (k as unknown as { results?: Result | Result[] }).results;
    if (!r) return [];
    return Array.isArray(r) ? r : [r];
}

export function getDateKey(daysAgo: number): string {
    return dayjs().tz(timezoneLabel).subtract(daysAgo, "day").format("YYYY-MM-DD");
}

export function getGroupByDate(k: Keyword): Record<string, Result> {
    return getResultsArray(k).reduce((acc, result) => {
        const key = dayjs.tz(result.tracked_at, timezoneLabel).format("YYYY-MM-DD");
        if (!acc[key] || dayjs.tz(result.tracked_at, timezoneLabel).isAfter(acc[key].tracked_at)) {
            acc[key] = result;
        }
        return acc;
    }, {} as Record<string, Result>);
}

export function getPositionOn(data: Keyword, daysAgo: number): string | number {
    const byDate = getGroupByDate(data);
    const rank = byDate[getDateKey(daysAgo)]?.rank_group;
    if (rank === 0) return 101;
    return typeof rank === "number" ? rank : "-";
}

export function getUrlForToday(data: Keyword): string | undefined {
    const byDate = getGroupByDate(data);
    return (
        byDate[getDateKey(0)]?.url ||
        getResultsArray(data)
            .sort(
                (a, b) =>
                    dayjs.tz(b.tracked_at, timezoneLabel).valueOf() -
                    dayjs.tz(a.tracked_at, timezoneLabel).valueOf()
            )[0]?.url
    );
}

export function getNumericPosition(data: Keyword, daysAgo: number): number | string {
    const rank = getGroupByDate(data)[getDateKey(daysAgo)]?.rank_group;
    if (rank === 0) return 101;
    return typeof rank === "number" ? rank : "-";
}

export function getHeaderLabel(daysAgo: number, locale = "en-CA"): string {
    const d = dayjs().tz(timezoneLabel).subtract(daysAgo, "day").toDate();
    const fmt = new Intl.DateTimeFormat(locale, { timeZone: timezoneLabel, month: "long", day: "2-digit" });
    const parts = fmt.formatToParts(d);
    return `${parts.find((p) => p.type === "day")?.value ?? ""} ${parts.find((p) => p.type === "month")?.value ?? ""}`;
}

export const posComparator = (a: any, b: any) => {
    if (a === "-" || a == null) return b === "-" || b == null ? 0 : 1;
    if (b === "-" || b == null) return -1;
    return Number(a) - Number(b);
};