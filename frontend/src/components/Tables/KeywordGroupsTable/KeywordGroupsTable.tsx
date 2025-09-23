import { AgGridReact } from 'ag-grid-react';
import { useMemo } from 'react';
import {columnDefs} from "./columns.tsx";
import type {KeywordGroup} from "../../types/keywordTypes.ts";
import '../../../style/keywordTable.css';

interface Props {
    keywordGroups: KeywordGroup[];
}

export default function KeywordGroupsTable({ keywordGroups }: Props) {

    const defaultColDef = useMemo(
        () => ({
            resizable: true,
            sortable: true,
            filter: true,
            minWidth: 100,
        }),
        []
    );

    if (!keywordGroups || keywordGroups.length === 0) {
        return <p>No keywords added yet.</p>;
    }

    return (
        <div className="ag-theme-alpine" style={{ height: 500, width: '100%' }}>
            <AgGridReact
                rowData={keywordGroups}
                columnDefs={columnDefs}
                defaultColDef={defaultColDef}
                pagination={true}
                paginationPageSize={20}
            />
        </div>
    );
}