import CircularProgress from "@mui/material/CircularProgress";
import type { ICellRendererParams } from "ag-grid-community";
import type { Keyword } from "../../types/keywordTypes";
import { getNumericPosition } from "./helpers";

const COLORS = {
    improved: "#2e7d32",
    worse: "#d32f2f",
    neutral: "#757575",
};

export const PositionWithTrend =
    (daysAgo: number) => (p: ICellRendererParams<Keyword>) => {

        const results = (p.data as any)?.results;
        if (!results || (Array.isArray(results) && results.length === 0)) {
            return <CircularProgress size={18} />;
        }

        const curr = getNumericPosition(p.data!, daysAgo);
        const prev = getNumericPosition(p.data!, daysAgo + 1);

        // No current data → show dash
        if (curr === "-") return <span>–</span>;

        // No previous data → show only the number
        if (prev === "-") return <span>{curr}</span>;

        const delta = (prev as number) - (curr as number);

        const color =
            delta > 0 ? COLORS.improved :
                delta < 0 ? COLORS.worse :
                    COLORS.neutral;

        const symbol =
            delta > 0 ? "▲" :
                delta < 0 ? "▼" :
                    "▬";

        return (
            <span
                style={{ display: "inline-flex", gap: 6, alignItems: "center" }}
                title={`Change vs previous day: ${delta > 0 ? `+${delta}` : delta}`}
            >
                <span>{curr}</span>
                <span style={{ color, fontSize: 12 }}>
                    {symbol} {Math.abs(delta)}
                </span>
            </span>
        );
    };