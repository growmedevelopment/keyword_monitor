import type { ColDef, ICellRendererParams } from 'ag-grid-community';

export const columnDefs: ColDef[] = [
    {
        headerName: 'Project Name',
        field: 'name',
        flex: 1,
        cellRenderer: (params: ICellRendererParams) => {
            return (
                <a
                    href={`/projects/${params.data.id}`}
                    style={{ color: '#1976d2', textDecoration: 'none' }}
                >
                    {params.value}
                </a>
            );
        },
        sort: 'asc',
    },
];