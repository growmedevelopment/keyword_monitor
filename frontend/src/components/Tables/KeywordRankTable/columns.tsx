import type { ColDef, ICellRendererParams } from 'ag-grid-community';

export const columnDefs: ColDef[] = [
    {
        field: 'month',
        headerName: 'Month',
        rowGroup: true,
        hide: true, // hides the column but still groups by it
    },
    {
        field: 'tracked_at',
        headerName: 'Date',
        sortable: true,
        width: 150, // fixed width
        valueFormatter: params =>
            new Date(params.value).toISOString().slice(0, 10),
    },
    {
        field: 'position',
        headerName: 'Position',
        sortable: true,
        width: 120, // fixed width
    },
    {
        field: 'url',
        headerName: 'URL',
        width: 400, // fixed width for long URLs
        cellRenderer: (params: ICellRendererParams) => {
            if (!params.value) return null;
            return (
                <a href={params.value as string} target="_blank" rel="noopener noreferrer">
                    {params.value}
                </a>
            );
        },
    },
];