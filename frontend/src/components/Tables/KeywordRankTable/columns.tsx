import type { ColDef, ICellRendererParams } from 'ag-grid-community';
import dayjs from 'dayjs';

export const columnDefs: ColDef[] = [
    {
        field: 'month',
        headerName: 'Month',
        rowGroup: true,
        hide: true, // hides the column but still groups by it
        sort: 'desc',
    },
    {
        field: 'tracked_at',
        headerName: 'Date',
        sortable: true,
        width: 150,
        comparator: (a, b) => dayjs(a).valueOf() - dayjs(b).valueOf(),
        valueFormatter: params =>
            new Date(params.value).toISOString().slice(0, 10),
    },
    {
        field: 'search_volume',
        headerName: 'Search Volume',
        sortable: true,
        width: 130,
        valueFormatter: params => params.value ? params.value.toLocaleString() : "-",
    },
    {
        field: 'position',
        headerName: 'Position',
        sortable: true,
        width: 60, // fixed width
    },
    {
        field: 'url',
        headerName: 'URL',
        width: 500, // fixed width for long URLs
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