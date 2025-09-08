import type { ColDef, ICellRendererParams } from 'ag-grid-community';
import ConfirmDeleteButton from "../ConfirmDeleteButton.tsx";
import projectService from "../../../services/projectService.ts";
import toast from "react-hot-toast";

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
                    title="Delete project?"
                    description={
                        <>Are you sure you want to delete <strong>{name}</strong>? Keyword progress will be saved, but no new results will be collected. You can restore this project later if needed.</>
                    }
                    confirmLabel="Delete"
                    color="error"
                    tooltip="Delete project"
                    onConfirm={async () => {
                        await projectService.delete(id);

                        // remove row from grid (client-side row model)
                        params.api.applyTransaction({ remove: [params.data] });

                        toast.success('Project deleted successfully');
                    }}
                    onError={(err) => {
                        const message =
                            err instanceof Error ? err.message : String(err);
                        toast.error(`Something went wrong: ${message}`);
                    }}
                    ariaLabel="delete project"
                />
            );
        },
    },
];