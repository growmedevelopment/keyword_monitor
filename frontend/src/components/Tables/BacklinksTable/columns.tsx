import type { ColDef, ICellRendererParams } from "ag-grid-community";
import type { BacklinkItem } from "../../../services/backlinkService";

// Status Code Badge
function StatusBadge(params: ICellRendererParams) {
    const code = params.value;

    if (!code) {
        return <span style={{ color: "#999" }}>—</span>;
    }

    const color =
        code >= 200 && code < 300
            ? "#4CAF50"
            : code >= 300 && code < 400
                ? "#FFC107"
                : "#F44336";

    return (
        <span
            style={{
                background: color,
                padding: "3px 8px",
                borderRadius: 6,
                color: "white",
                fontWeight: 600,
            }}
        >
            {code}
        </span>
    );
}

// Indexed Badge
function IndexBadge(params: ICellRendererParams) {
    const indexed = params.value;

    if (indexed === null || indexed === undefined) {
        return <span style={{ color: "#999" }}>—</span>;
    }

    return (
        <span
            style={{
                background: indexed ? "#4CAF50" : "#F44336",
                padding: "3px 8px",
                borderRadius: 6,
                color: "white",
                fontWeight: 600,
            }}
        >
            {indexed ? "Indexed" : "Not indexed"}
        </span>
    );
}

export function buildBacklinkColumnDefs(): ColDef<BacklinkItem>[] {
    return [
        {
            headerName: "URL",
            field: "url",
            width: 350,
            cellRenderer: (p: ICellRendererParams) => (
                <a
                    href={p.value}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        color: "#1976d2",
                        textDecoration: "none",
                        fontWeight: 500,
                    }}
                >
                    {p.value}
                </a>
            ),
        },

        // Latest status code
        {
            headerName: "Status Code",
            width: 130,
            valueGetter: (params) =>
                params.data?.latest_result.http_code ?? null,
            cellRenderer: StatusBadge,
        },

        // Latest indexed flag
        {
            headerName: "Indexed",
            width: 130,
            valueGetter: (params) =>
                params.data?.latest_result.indexed ?? null,
            cellRenderer: IndexBadge,
        },

        // Last checked datetime
        {
            headerName: "Last Checked",
            width: 180,
            valueGetter: (params) =>
                params.data?.latest_result.checked_at ?? null,
            valueFormatter: (p) => {
                if (!p.value) return "-";
                return new Date(p.value).toLocaleString();
            },
        },

        // History button
        {
            headerName: "History",
            width: 120,
            cellRenderer: (p: ICellRendererParams) => (
                <button
                    style={{
                        padding: "6px 12px",
                        background: "#1976d2",
                        color: "white",
                        border: "none",
                        borderRadius: 6,
                        cursor: "pointer",
                    }}
                    onClick={() => p.context.openHistory(p.data)}
                >
                    View
                </button>
            ),
        },
    ];
}