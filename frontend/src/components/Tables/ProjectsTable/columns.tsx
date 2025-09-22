import type { ColDef, ICellRendererParams } from 'ag-grid-community';
import ConfirmDeleteButton from "../ConfirmDeleteButton.tsx";
import projectService from "../../../services/projectService.ts";
import toast from "react-hot-toast";
import ArchiveIcon from '@mui/icons-material/Archive';

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
    {
        headerName: 'Actions',
        field: 'id',
        maxWidth: 100,
        sortable: false,
        filter: false,
        cellRenderer: (params: ICellRendererParams) => {
            const id = params.data.id as number;
            const name = params.data.name as string;

            return (
                <ConfirmDeleteButton
                    title="Archive project?"
                    description={
                        <>Are you sure you want to archive <strong>{name}</strong>? Keyword progress will be saved, but no new results will be collected. You can restore this project later if needed.</>
                    }
                    confirmLabel="Archive"
                    color="primary"
                    tooltip="Archive project"
                    onConfirm={async () => {
                        await projectService.delete(id);

                        // remove row from grid (client-side row model)
                        params.api.applyTransaction({ remove: [params.data] });

                        toast.success('Project archived successfully');
                    }}
                    onError={(err) => {
                        const message =
                            err instanceof Error ? err.message : String(err);
                        toast.error(`Something went wrong: ${message}`);
                    }}
                    ariaLabel="Archive project"
                    icon={<ArchiveIcon fontSize="small" />}
                />
            );
        },
    },
];