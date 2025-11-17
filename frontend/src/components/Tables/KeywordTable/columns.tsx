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
            cellRenderer: (p: ICellRendererParams) => {
                const url = p.value;

                if (url === undefined || url === null) {
                    return <CircularProgress size={18} />;
                }

                if (url === "") {
                    return <span></span>;
                }

                return (
                    <a href={url} style={{textDecoration: "none"}} target="_blank" rel="noopener noreferrer">
                        <svg xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" viewBox="0 0 1024 1024">
                            <rect width="1024" height="1024" fill="none" />
                            <path fill="currentColor" d="M574 665.4a8.03 8.03 0 0 0-11.3 0L446.5 781.6c-53.8 53.8-144.6 59.5-204 0c-59.5-59.5-53.8-150.2 0-204l116.2-116.2c3.1-3.1 3.1-8.2 0-11.3l-39.8-39.8a8.03 8.03 0 0 0-11.3 0L191.4 526.5c-84.6 84.6-84.6 221.5 0 306s221.5 84.6 306 0l116.2-116.2c3.1-3.1 3.1-8.2 0-11.3zm258.6-474c-84.6-84.6-221.5-84.6-306 0L410.3 307.6a8.03 8.03 0 0 0 0 11.3l39.7 39.7c3.1 3.1 8.2 3.1 11.3 0l116.2-116.2c53.8-53.8 144.6-59.5 204 0c59.5 59.5 53.8 150.2 0 204L665.3 562.6a8.03 8.03 0 0 0 0 11.3l39.8 39.8c3.1 3.1 8.2 3.1 11.3 0l116.2-116.2c84.5-84.6 84.5-221.5 0-306.1M610.1 372.3a8.03 8.03 0 0 0-11.3 0L372.3 598.7a8.03 8.03 0 0 0 0 11.3l39.6 39.6c3.1 3.1 8.2 3.1 11.3 0l226.4-226.4c3.1-3.1 3.1-8.2 0-11.3z" />
                        </svg>
                    </a>
                );
            },
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