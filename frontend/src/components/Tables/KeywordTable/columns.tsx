import type { ColDef, ICellRendererParams } from "ag-grid-community";
import CircularProgress from "@mui/material/CircularProgress";
import { Dayjs } from "dayjs";
import { Box, Link } from '@mui/material';
import type { Keyword } from "../../types/keywordTypes";
import {
    getNumericPosition,
    getUrlForToday,
} from "./helpers";

import { PositionWithTrend } from "./PositionWithTrend";
import { GroupCell } from "./GroupCell";
import RemoveKeywordCell from "./RemoveKeywordCell";

export function buildColumnDefs(
    from: Dayjs,
    to: Dayjs,
    mode: "range" | "compare"
): ColDef<Keyword>[] {

    // STATIC COLUMNS
    const staticCols: ColDef<Keyword>[] = [
        {
            field: "keyword",
            headerName: "Keyword",
            width: 200,
            sort: "asc",
            cellRenderer: (p: ICellRendererParams<Keyword, string>) => {
                return (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Link
                            href={`/keywords/${p.data?.id}`}
                            underline="none"
                            sx={{
                                color: "#1976d2",
                                fontWeight: 500,
                                textDecoration: "none",
                                "&:hover": { textDecoration: "underline" },
                            }}
                        >
                            {p.value}
                        </Link>
                    </Box>
                );
            },
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

    const removeCol: ColDef<Keyword> = {
        headerName: "Remove",
        width: 110,
        sortable: false,
        filter: false,
        cellRenderer: RemoveKeywordCell,
    };

    // RANGE MODE
    if (mode === "range") {
        const dateCols: ColDef<Keyword>[] = [];

        let cursor = from.clone();
        let index = 0;

        while (cursor.isBefore(to) || cursor.isSame(to, "day")) {
            dateCols.push({
                headerName: cursor.format("MMM D"),
                width: 110,
                valueGetter: (p) => getNumericPosition(p.data!, index),
                cellRenderer: PositionWithTrend(index),
            });

            cursor = cursor.add(1, "day");
            index++;
        }

        return [...staticCols, ...dateCols, removeCol];
    }

    // COMPARE MODE — two columns
    if (mode === "compare") {
        return [
            ...staticCols,
            {
                headerName: from.format("MMM D"),
                width: 110,
                valueGetter: (p) => getNumericPosition(p.data!, 0),
                cellRenderer: PositionWithTrend(0),
            },
            {
                headerName: to.format("MMM D"),
                width: 110,
                valueGetter: (p) => getNumericPosition(p.data!, 1),
                cellRenderer: PositionWithTrend(1),
            },
            removeCol,
        ];
    }

    return [...staticCols, removeCol];
}