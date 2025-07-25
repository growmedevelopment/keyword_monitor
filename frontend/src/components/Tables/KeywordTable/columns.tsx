import type { ColDef, ICellRendererParams } from 'ag-grid-community';
import type { Keyword } from '../../types/keywordTypes';

export const columnDefs: ColDef<Keyword>[] = [
    // Keyword column
    {
        field: 'keyword',
        headerName: 'Keyword',
        width: 200,
        cellRenderer: (params: ICellRendererParams) => {
            return (
                <a
                    href={`/keywords/${params.data?.id}`}
                    style={{ color: '#1976d2', textDecoration: 'none' }}
                >
                    {params.value}
                </a>
            );
        },
    },

    // Status column
    {
        field: 'status',
        headerName: 'Status',
        width: 120,
        cellRenderer: (params: ICellRendererParams) => {
            const isLoading = params.value !== 'Completed';
            const color = isLoading ? '#ff9800' : '#2e7d32'; // warning or success
            return <span style={{ color }}>{params.value}</span>;
        },
    },

    // Position column using valueGetter
    {
        headerName: 'Position',
        width: 100,
        valueGetter: (params) => {
            if (params.data?.status !== 'Completed') return '-';
            return params.data?.results?.[0]?.rank_group ?? '-';
        },
    },

    // Title column using valueGetter
    {
        headerName: 'Title',
        width: 300,
        valueGetter: (params) => {
            if (params.data?.status !== 'Completed') return '-';
            return params.data?.results?.[0]?.title ?? '-';
        },
    },

    // URL column using valueGetter + custom link
    {
        headerName: 'URL',
        width: 400,
        valueGetter: (params) => {
            if (params.data?.status !== 'Completed') return '-';
            return params.data?.results?.[0]?.url ?? '-';
        },
        cellRenderer: (params: ICellRendererParams) => {
            if (!params.value || params.value === '-') return '-';
            return (
                <a href={params.value} target="_blank" rel="noopener noreferrer" style={{ color: '#1976d2' }}>
                    {params.value}
                </a>
            );
        },
    },
];