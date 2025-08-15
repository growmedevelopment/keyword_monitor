import { AgGridReact } from 'ag-grid-react';
import { useMemo } from 'react';
import {columnDefs} from "./columns.tsx";
import type {Keyword} from "../../types/keywordTypes.ts";



interface Props {
    keywords: Keyword[];
}

export default function KeywordTable({ keywords }: Props) {

    const defaultColDef = useMemo(
        () => ({
            resizable: true,
            sortable: true,
            filter: true,
            minWidth: 100,
        }),
        []
    );

    if (!keywords || keywords.length === 0) {
        return <p>No keywords added yet.</p>;
    }

    return (
        <div className="ag-theme-alpine" style={{ height: 500, width: '100%' }}>
            <AgGridReact
                rowData={keywords}
                columnDefs={columnDefs}
                defaultColDef={defaultColDef}
                pagination={true}
                paginationPageSize={20}
            />
        </div>
    );
}