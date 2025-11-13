import type { ColDef, ICellRendererParams } from "ag-grid-community";
import CircularProgress from "@mui/material/CircularProgress";
import { Box, Link } from "@mui/material";
import type { Keyword } from "../../types/keywordTypes";

import RemoveKeywordCell from "./RemoveKeywordCell";
import { getPositionOn, getUrlForToday, posComparator } from "./helpers";
import { PositionWithTrend } from "./PositionWithTrend";
import { GroupCell } from "./GroupCell";

import  { Dayjs } from "dayjs";

// ----------------------------------------
// BUILD DYNAMIC COLUMNS BASED ON DATE RANGE
// ----------------------------------------

export const buildColumnDefs = (
    start: Dayjs,
    end: Dayjs
): ColDef<Keyword>[] => {
    const dateColumns: ColDef<Keyword>[] = [];

    let cursor = end;

    while (cursor.isSameOrAfter(start, "day")) {
        const diff = end.diff(cursor, "day"); // (0 = last day, 1 = previous, etc.)
        const label = cursor.format("MMM D"); // Example: "Nov 13"

        dateColumns.push({
            headerName: label,
            width: 130,
            valueGetter: (p) => getPositionOn(p.data!, diff),
            comparator: posComparator,
            cellRenderer: PositionWithTrend(diff),
        });

        cursor = cursor.subtract(1, "day");
    }

    return [
        // ------------------
        // STATIC COLUMNS
        // ------------------

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

        // ------------------
        // DYNAMIC DATE COLUMNS
        // ------------------

        ...dateColumns,

        // ------------------
        // REMOVE COLUMN
        // ------------------

        {
            headerName: "Remove",
            width: 110,
            sortable: false,
            filter: false,
            suppressNavigable: true,
            cellRenderer: RemoveKeywordCell,
        },
    ];
};