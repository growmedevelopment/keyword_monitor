import { AgGridReact } from 'ag-grid-react';
import { useMemo } from 'react';
import {columnDefs} from "./columns.tsx";


interface projectKeyword{
    id: number;
    keyword: string;
    status: 'Queued' | 'Completed' | 'Submitted';
    results: {
        type: string;
        rank_absolute: number;
        rank_group: number;
        url: string;
        title: string;
    };

}

interface Props {
    keywords: projectKeyword[];
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