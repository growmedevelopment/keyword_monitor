import { AgGridReact } from 'ag-grid-react';
import { useMemo, useState } from 'react';
import { columnDefs } from './columns';
import { themeAlpine } from 'ag-grid-community';

interface Project {
    id: number;
    name: string;
    url: string;
}

export default function ProjectsTable({ projects }: { projects: Project[] }) {
    // 2. Create state for the search text
    const [searchText, setSearchText] = useState('');

    const defaultColDef = useMemo(() => ({
        flex: 1,
        sortable: true,
        filter: true,
        resizable: true,
        minWidth: 120,
    }), []);

    const onSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchText(event.target.value);
    };

    return (
        <div style={{ width: '100%' }}>
            <div style={{ padding: '10px 0', display: 'flex', justifyContent: 'flex-end' }}>
                <input
                    type="text"
                    placeholder="Search projects..."
                    onChange={onSearchChange}
                    style={{
                        padding: '8px',
                        width: '300px',
                        border: '1px solid #ccc',
                        borderRadius: '4px'
                    }}
                />
            </div>

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
                    quickFilterText={searchText}
                />
            </div>
        </div>
    );
}