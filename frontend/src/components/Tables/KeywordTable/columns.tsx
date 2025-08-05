import type { ColDef, ICellRendererParams } from 'ag-grid-community';

interface ProjectKeyword {
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

type NonNullableCellParams = ICellRendererParams<ProjectKeyword, string> & { data: ProjectKeyword };

export const columnDefs: ColDef<ProjectKeyword>[] = [
    // Keyword column
    {
        field: 'keyword',
        headerName: 'Keyword',
        width: 200,
        cellRenderer: (params: NonNullableCellParams) => (
            <a
                href={`/keywords/${params.data.id}`}
                style={{ color: '#1976d2', textDecoration: 'none' }}
            >
                {params.value}
            </a>
        ),
        sort: 'asc',
    },

    // Status column
    {
        field: 'status',
        headerName: 'Status',
        width: 120,
        cellRenderer: (params: NonNullableCellParams) => {
            const isLoading = params.value !== 'Completed';
            const color = isLoading ? '#ff9800' : '#2e7d32'; // warning or success
            return <span style={{ color }}>{params.value}</span>;
        },
    },

    // Position column
    {
        headerName: 'Position',
        width: 100,
        valueGetter: (params) => params.data?.results.rank_group,
    },

    // Title column
    {
        headerName: 'Title',
        width: 300,
        valueGetter: (params) => params.data?.results.title,
    },

    // URL column
    {
        headerName: 'URL',
        width: 400,
        valueGetter: (params) => params.data?.results.url,
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