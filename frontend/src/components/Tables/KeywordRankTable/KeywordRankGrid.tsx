import { AgGridReact } from 'ag-grid-react';
import { useMemo } from 'react';
import { columnDefs } from './columns';
import { themeAlpine } from 'ag-grid-community';
import type {KeywordRank} from "../../types/keywordTypes.ts";
import dayjs from "dayjs";

interface Props {
    data: KeywordRank[];
}
export default function KeywordRankGrid({ data }: Props) {
    const defaultColDef = useMemo(() => ({
        flex: 1,
        minWidth: 100,
        sortable: true,
        filter: true,
        resizable: true,
    }), []);

    const processedData = data.map(item => ({
        ...item,
        month: dayjs(item.tracked_at).format("YYYY-MM"), // e.g., 2025-07
    }));


    return (
        <div className="ag-theme-alpine" style={{ height: 500, width: '100%' }}>
            <AgGridReact
                theme={themeAlpine}
                rowData={processedData}
                columnDefs={columnDefs}
                defaultColDef={defaultColDef}
                groupDisplayType="groupRows"
                autoGroupColumnDef={{
                    headerName: 'Month',

                    cellRendererParams: { suppressCount: false },
                }}
                pagination={true}
                paginationPageSize={50}
            />
        </div>
    );
}