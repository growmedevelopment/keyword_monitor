import type { ColDef, ICellRendererParams } from "ag-grid-community";
import CircularProgress from "@mui/material/CircularProgress";
import dayjs, { Dayjs } from "dayjs";
import { Box, Link } from '@mui/material';
import type { Keyword } from "../../types/keywordTypes";
import {getPositionForExactDate, getUrlForToday} from "./helpers";

import { PositionWithTrend } from "./PositionWithTrend";
import { GroupCell } from "./GroupCell";
import RemoveKeywordCell from "./RemoveKeywordCell";

export function buildColumnDefs(
    from: Dayjs,
    to: Dayjs,
    mode: "range" | "compare" | "latest",
    keywords: Keyword[] = []
): ColDef<Keyword>[] {

    // STATIC COLUMNS
    const staticCols: ColDef<Keyword>[] = [
        {
            field: "created_at",
            hide: true,
            sortable: true,
            sort: "asc",
            sortIndex: 0,
            valueGetter: (p) => p.data?.created_at,
        },
        {
            field: "keyword",
            headerName: "Keyword",
            width: 200,
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
            width: 200,
            valueGetter: (p) => p.data?.keyword_groups,
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

        while (cursor.isBefore(to) || cursor.isSame(to, "day")) {
            const dateKey = cursor.format("YYYY-MM-DD");   // exact API key
            const headerLabel = cursor.format("MMM D");    // column label

            dateCols.push({
                headerName: headerLabel,
                width: 110,
                valueGetter: (p) => getPositionForExactDate(p.data, dateKey),
                cellRenderer: PositionWithTrend(dateKey),   // trend by real date
            });

            cursor = cursor.add(1, "day");
        }

        return [...staticCols, ...dateCols, removeCol];
    }

    // COMPARE MODE — two columns using exact date keys
    if (mode === "compare") {
        const fromKey = from.format("YYYY-MM-DD");
        const toKey   = to.format("YYYY-MM-DD");

        return [
            ...staticCols,

            {
                headerName: from.format("MMM D"),
                width: 110,
                valueGetter: (p) => getPositionForExactDate(p.data, fromKey),
                cellRenderer: PositionWithTrend(fromKey),
            },

            {
                headerName: to.format("MMM D"),
                width: 110,
                valueGetter: (p) => getPositionForExactDate(p.data, toKey),
                cellRenderer: PositionWithTrend(toKey),
            },

            removeCol,
        ];
    }

    // LATEST MODE — two columns showing last 2 results
    if (mode === "latest") {
        const firstKw = keywords[0];
        const latestTrackedAt = firstKw?.results?.[0]?.tracked_at;
        const previousTrackedAt = firstKw?.results?.[1]?.tracked_at;

        const latestHeader = latestTrackedAt ? dayjs(latestTrackedAt).format("MMM D") : "Latest Result";
        const previousHeader = previousTrackedAt ? dayjs(previousTrackedAt).format("MMM D") : "Previous Result";

        return [
            ...staticCols,
            {
                headerName: previousHeader,
                width: 130,
                valueGetter: (p) => {
                    const results = p.data?.results || [];
                    return results.length >= 2 ? results[1].position : (results.length === 1 ? "-" : null);
                },
                cellRenderer: (p: ICellRendererParams) => {
                    const results = p.data?.results || [];
                    const date = results.length >= 2 ? results[1].tracked_at : null;
                    if (!date) return <span>{p.value ?? "-"}</span>;
                    return PositionWithTrend(dayjs(date).format("YYYY-MM-DD"))(p);
                }
            },
            {
                headerName: latestHeader,
                width: 130,
                valueGetter: (p) => {
                    const results = p.data?.results || [];
                    return results.length >= 1 ? results[0].position : null;
                },
                cellRenderer: (p: ICellRendererParams) => {
                    const results = p.data?.results || [];
                    const date = results.length >= 1 ? results[0].tracked_at : null;
                    if (!date) return <span>{p.value ?? "-"}</span>;
                    return PositionWithTrend(dayjs(date).format("YYYY-MM-DD"))(p);
                }
            },
            removeCol,
        ];
    }

    return [...staticCols, removeCol];
}