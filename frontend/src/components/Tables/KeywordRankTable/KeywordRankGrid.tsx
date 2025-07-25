import { AgGridReact } from 'ag-grid-react';
import { useMemo } from 'react';
import { columnDefs } from './columns';
import { themeAlpine } from 'ag-grid-community';
import type { KeywordRank } from "../../types/keywordTypes.ts";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

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

    dayjs.extend(utc);

    const processedData = data.map(item => ({
        ...item,
        month: dayjs.utc(item.tracked_at).format("YYYY-MM"), // group key
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
                    valueFormatter: params =>
                        dayjs(params.value, "YYYY-MM").format("MMMM YYYY"), // "July 2025"
                    cellRendererParams: { suppressCount: false },
                }}
                pagination={true}
                paginationPageSize={50}
            />
        </div>
    );
}