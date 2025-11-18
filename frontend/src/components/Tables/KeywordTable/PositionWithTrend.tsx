import CircularProgress from "@mui/material/CircularProgress";
import type { ICellRendererParams } from "ag-grid-community";
import type { Keyword } from "../../types/keywordTypes";

// Simple colors for trend arrows
const COLORS = {
    improved: "#2e7d32",
    worse: "#d32f2f",
    neutral: "#757575",
};

/**
 * Correct version:
 * PositionWithTrend now uses *dateKey* (string) instead of index
 * Example of dateKey: "2025-11-17"
 */
export const PositionWithTrend =
    (dateKey: string) => (p: ICellRendererParams<Keyword>) => {

        const results = p.data?.results;

        // No results → show spinner
        if (!results || results.length === 0) {
            return <CircularProgress size={18} />;
        }

        // Convert results into a map:  { "YYYY-MM-DD": result }
        const map: Record<string, any> = {};
        results.forEach(r => {
            const key = r.tracked_at.substring(0, 10); // "YYYY-MM-DD"
            map[key] = r;
        });

        // Current day's rank
        const curr = map[dateKey]?.position ?? "-";

        // Get sorted list of actual dates
        const allDates = Object.keys(map).sort();          // oldest → newest
        const currIndex = allDates.indexOf(dateKey);

        // Previous real date (not index-1 blindly)
        const prevKey = currIndex > 0 ? allDates[currIndex - 1] : null;

        // Previous day's rank
        const prev = prevKey ? (map[prevKey]?.position ?? "-") : "-";

        // No data → show dash
        if (curr === "-") return <span>–</span>;
        if (prev === "-") return <span>{curr}</span>;

        // Trend calculation (NEWER minus OLDER)
        const delta = curr - prev;

        const color =
            delta < 0 ? COLORS.improved :        // rank improved
                delta > 0 ? COLORS.worse :           // rank got worse
                    COLORS.neutral;

        const symbol =
            delta < 0 ? "▲" :
                delta > 0 ? "▼" :
                    "▬";

        return (
            <span
                style={{ display: "inline-flex", gap: 6, alignItems: "center" }}
                title={`Change vs previous date: ${delta > 0 ? `+${delta}` : delta}`}
            >
                <span>{curr}</span>

                <span style={{ color, fontSize: 12 }}>
                    {symbol} {Math.abs(delta)}
                </span>
            </span>
        );
    };