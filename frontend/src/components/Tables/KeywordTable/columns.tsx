import type { ColDef, ICellRendererParams } from 'ag-grid-community';
import dayjs from "dayjs";
import type {Keyword} from "../../types/keywordTypes.ts";


type NonNullableCellParams = ICellRendererParams<Keyword, string> & { data: Keyword };


const twoDaysAgo = dayjs().subtract(2, "day").format("DD MMMM");
const treeDaysAgo = dayjs().subtract(3, "day").format("DD MMMM");

export const columnDefs: ColDef<Keyword>[] = [
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



    // Title column
    // {
    //     headerName: 'Title',
    //     width: 300,
    //     valueGetter: (params) => params.data?.results.title,
    // },

    // URL column
    {
        headerName: 'URL',
        width: 70,
        valueGetter: (params) => params.data?.results.url,
        cellRenderer: (params: ICellRendererParams) => {
            if (!params.value) return null;
            return (
                <a href={params.value as string} target="_blank" rel="noopener noreferrer">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                        <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
                            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                        </g>
                    </svg>
                </a>
            );
        },
    },

    // Position column
    {
        headerName: 'Today',
        width: 130,
        valueGetter: (params) => params.data?.results.rank_group,
    },

    {
        headerName: 'Yesterday',
        width: 130,
        valueGetter: (params) => params.data?.results.rank_group,
    },

    {
        headerName: twoDaysAgo,
        width: 130,
        valueGetter: (params) => params.data?.results.rank_group,
    },

    {
        headerName: treeDaysAgo,
        width: 130,
        valueGetter: (params) => params.data?.results.rank_group,
    },
];