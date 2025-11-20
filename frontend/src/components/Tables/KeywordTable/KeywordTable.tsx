import { AgGridReact } from "ag-grid-react";
import { useMemo, useEffect, useState } from "react";
import "../../../style/keywordTable.css";

import type { Keyword, KeywordGroup } from "../../types/keywordTypes";
import { buildColumnDefs } from "./columns";
import { Dayjs } from "dayjs";
import type { ColDef } from "ag-grid-community";

interface Props {
    keywords: Keyword[];
    keywordGroups: KeywordGroup[];
    dateRange: [Dayjs, Dayjs];
    mode: "range" | "compare";
}

export default function KeywordTable({keywords, keywordGroups, dateRange, mode}: Props) {

    const [columnDefs, setColumnDefs] = useState<ColDef<Keyword>[]>([]);

    const defaultColDef = useMemo(
        () => ({
            resizable: true,
            sortable: true,
            filter: true,
            minWidth: 100
        }),
        []
    );

    useEffect(() => {
        if (dateRange[0] && dateRange[1]) {
            const cols = buildColumnDefs(dateRange[0], dateRange[1], mode);
            setColumnDefs(cols);
        }
    }, [dateRange, mode]);

    if (!keywords || keywords.length === 0) {
        return <p>No keywords added yet.</p>;
    }

    return (
        <div className="ag-theme-alpine" style={{ height: 500, width: "100%" }}>
            <AgGridReact
                rowData={keywords}
                columnDefs={columnDefs}
                defaultColDef={defaultColDef}
                pagination={true}
                paginationPageSize={20}
                context={{ keywordGroups }}
                suppressMultiSort={true}

            />
        </div>
    );
}