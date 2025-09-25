import type { ColDef, ICellRendererParams } from "ag-grid-community";
import CircularProgress from "@mui/material/CircularProgress";
import { Box, Link } from "@mui/material";
import type { Keyword } from "../../types/keywordTypes";
import RemoveKeywordCell from "./RemoveKeywordCell.tsx";

import { getPositionOn, getUrlForToday, posComparator, getHeaderLabel } from "./helpers";
import { PositionWithTrend } from "./PositionWithTrend";
import { GroupCell } from "./GroupCell";

const twoDaysAgo = getHeaderLabel(2);
const threeDaysAgo = getHeaderLabel(3);

export const columnDefs: ColDef<Keyword>[] = [
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
        cellRenderer: GroupCell ,
        filter: false,
    },
    {
        headerName: "URL",
        width: 90,
        filter: false,
        valueGetter: (p) => getUrlForToday(p.data!),
        cellRenderer: (p: ICellRendererParams) =>
            p.value ? (<a href={p.value} target="_blank" rel="noopener noreferrer">🔗</a>) : (
                <CircularProgress size={18} />
            ),
    },
    { headerName: "Today", width: 130, valueGetter: (p) => getPositionOn(p.data!, 0), comparator: posComparator, cellRenderer: PositionWithTrend(0) },
    { headerName: "Yesterday", width: 130, valueGetter: (p) => getPositionOn(p.data!, 1), comparator: posComparator, cellRenderer: PositionWithTrend(1) },
    { headerName: twoDaysAgo, width: 130, valueGetter: (p) => getPositionOn(p.data!, 2), comparator: posComparator, cellRenderer: PositionWithTrend(2) },
    { headerName: threeDaysAgo, width: 130, valueGetter: (p) => getPositionOn(p.data!, 3), comparator: posComparator, cellRenderer: PositionWithTrend(3) },
    { headerName: "Remove", width: 110, sortable: false, filter: false, suppressNavigable: true, cellRenderer: RemoveKeywordCell },
];