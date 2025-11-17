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
    (index: number) => (p: ICellRendererParams<Keyword>) => {

        const results = (p.data as any)?.results;
        if (!results || (Array.isArray(results) && results.length === 0)) {
            return <CircularProgress size={18} />;
        }

        // LEFT → RIGHT chronological display
        // So older = index, newer = index - 1
        const curr = getNumericPosition(p.data!, index);
        const prev = index > 0 ? getNumericPosition(p.data!, index - 1) : "-";

        if (curr === "-") return <span>–</span>;
        if (prev === "-") return <span>{curr}</span>;

        // Reverse because newer - older
        const delta = (curr as number) - (prev as number);

        const color =
            delta < 0 ? COLORS.improved :      // moved UP in ranking
                delta > 0 ? COLORS.worse : COLORS.neutral;

        const symbol =
            delta < 0 ? "▲" :
                delta > 0 ? "▼" :
                    "▬";

        return (
            <span
                style={{ display: "inline-flex", gap: 6, alignItems: "center" }}
                title={`Change vs next day: ${delta > 0 ? `+${delta}` : delta}`}
            >
                <span>{curr}</span>
                <span style={{ color, fontSize: 12 }}>
                    {symbol} {Math.abs(delta)}
                </span>
            </span>
        );
    };