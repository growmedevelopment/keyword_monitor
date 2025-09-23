import type { ColDef, ICellRendererParams } from 'ag-grid-community';
import { Chip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import type { KeywordGroup } from '../../types/keywordTypes';
import keywordGroupService from "../../../services/keywordGroupService.ts";
import toast from "react-hot-toast";
import ConfirmDeleteButton from "../ConfirmDeleteButton.tsx";
import tinycolor from "tinycolor2";

export const columnDefs: ColDef<KeywordGroup>[] = [
    {
        field: 'name',
        headerName: 'Group Name',
        flex: 1,
        cellRenderer: (params: ICellRendererParams<KeywordGroup>) => (
            <span>{params.value}</span>
        ),
    },
    {
        field: 'color',
        headerName: 'Color',
        flex: 1,
        cellRenderer: (params: ICellRendererParams<KeywordGroup>) => {
            const color = params.value ?? '#ffffff';
            const textColor = tinycolor(color).isLight() ? '#000' : '#fff';

            return (
                <Chip
                    label={color}
                    sx={{
                        backgroundColor: color,
                        color: textColor,
                        fontWeight: 500,
                        borderRadius: 1,
                        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                    }}
                    size="small"
                />
            );
        },
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
                    title="Delete keyword group?"
                    description={
                        <>
                            Are you sure you want to delete <strong>{name}</strong>? This action cannot be undone.
                        </>
                    }
                    confirmLabel="Delete"
                    color="error"
                    tooltip="Delete keyword group"
                    onConfirm={async () => {
                        await keywordGroupService.delete(id);

                        // remove row from grid (client-side row model)
                        params.api.applyTransaction({ remove: [params.data] });

                        toast.success('Keyword group deleted successfully');
                    }}
                    onError={(err) => {
                        const message = err instanceof Error ? err.message : String(err);
                        toast.error(`Something went wrong: ${message}`);
                    }}
                    ariaLabel="Delete keyword group"
                    icon={<DeleteIcon fontSize="small" />}
                />
            );
        },
    }
];