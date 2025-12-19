import { AgGridReact } from 'ag-grid-react';
import { useMemo } from 'react';
import { columnDefs } from './columns';
import { themeAlpine } from 'ag-grid-community';

interface Project {
    id: number;
    name: string;
    url: string;
}

export default function ProjectsTable({ projects }: { projects: Project[] }) {
    const defaultColDef = useMemo(() => ({
        flex: 1,
        sortable: true,
        filter: true,
        resizable: true,
        minWidth: 120,
    }), []);

    return (
        <div className="ag-theme-alpine" style={{ width: '100%' }}>
            <AgGridReact
                theme={themeAlpine}
                rowData={projects}
                columnDefs={columnDefs}
                defaultColDef={defaultColDef}
                pagination
                paginationPageSize={20}
                paginationPageSizeSelector={[ 20, 35, 50, 100]}
                domLayout="autoHeight"
            />
        </div>
    );
}