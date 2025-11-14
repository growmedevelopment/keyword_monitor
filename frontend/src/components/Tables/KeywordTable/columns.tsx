import type { ColDef, ICellRendererParams } from "ag-grid-community";
import CircularProgress from "@mui/material/CircularProgress";
import { Dayjs } from "dayjs";
import type { Keyword } from "../../types/keywordTypes";
import {getPositionOn, getUrlForToday} from "./helpers";
import { PositionWithTrend } from "./PositionWithTrend";
import { GroupCell } from "./GroupCell";
import RemoveKeywordCell from "./RemoveKeywordCell";

export function buildColumnDefs(
    from: Dayjs,
    to: Dayjs,
    mode: "range" | "compare" = "range"
): ColDef<Keyword>[] {

    // ==== STATIC COLUMNS (always visible and unchanged) ====
    const staticCols: ColDef<Keyword>[] = [
        {
            field: "keyword",
            headerName: "Keyword",
            width: 200,
            sort: "asc",
        },
        {
            headerName: "Group/Tag",
            width: 150,
            valueGetter: (p) => p.data?.keyword_group_name,
            cellRenderer: GroupCell,
        },
        {
            headerName: "URL",
            width: 90,
            filter: false,
            valueGetter: (p) => getUrlForToday(p.data!),
            cellRenderer: (p: ICellRendererParams) =>
                p.value ? (
                    <a href={p.value} target="_blank" rel="noopener noreferrer">
                        🔗
                    </a>
                ) : (
                    <CircularProgress size={18} />
                ),
        },
    ];

    // === DYNAMIC DATE COLUMNS ===

    if (mode === "range") {
        const dayCols: ColDef<Keyword>[] = [];

        let cursor = from.clone();
        let index = 0;

        while (cursor.isBefore(to) || cursor.isSame(to, "day")) {
            dayCols.push({
                headerName: cursor.format("MMM D"),
                width: 110,
                valueGetter: (p) => getPositionOn(p.data!, index),
                cellRenderer: PositionWithTrend(index),
            });

            cursor = cursor.add(1, "day");
            index++;
        }

        return [
            ...staticCols,
            ...dayCols,
            {
                headerName: "Remove",
                width: 110,
                sortable: false,
                filter: false,
                cellRenderer: RemoveKeywordCell,
            }
        ];
    }

    // === COMPARE MODE: Only 2 columns ===

    if (mode === "compare") {
        const compareCols: ColDef<Keyword>[] = [
            {
                headerName: from.format("MMM D"),
                width: 110,
                valueGetter: (p) => getPositionOn(p.data!, 0),
                cellRenderer: PositionWithTrend(0),
            },
            {
                headerName: to.format("MMM D"),
                width: 110,
                valueGetter: (p) => getPositionOn(p.data!, 1),
                cellRenderer: PositionWithTrend(1),
            },
        ];

        return [
            ...staticCols,
            ...compareCols,
            {
                headerName: "Remove",
                width: 110,
                sortable: false,
                filter: false,
                cellRenderer: RemoveKeywordCell,
            }
        ];
    }

    return staticCols;
}