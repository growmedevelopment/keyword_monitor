import { useMemo, useState } from "react";
import {
    Button, Paper,
    Stack, Typography,
} from "@mui/material";
import { AgGridReact } from "ag-grid-react";
import {columnDefs} from "./columns.tsx";
import type { LinkItem } from "../../../services/linkService.ts";
import linkService from "../../../services/linkService.ts";
import toast from "react-hot-toast";
import AddUrlDialog from "../../Dialogs/AddUrl/AddUrlDialog.tsx";


interface Props {
    type: 'backlinks' | 'citations';
    links: LinkItem[];
    loading: boolean;
    onRefresh?: () => void;
    onDelete?: (id: number) => void;
    projectId: string;
    openHistory: (item: LinkItem) => void;
}

export default function LinksTable({type, links, loading, projectId, openHistory, onRefresh, onDelete}: Props) {

    const [addingUrlDialog, setAddingUrlDialog] = useState(false);
    const link_type = type === 'backlinks' ? 'Backlinks' : 'Citations';

    const handleAddUrl = async (urls: string[]) => {
        try {
            const response = await linkService.create(projectId, urls, type);
            toast.success(response.message);
            onRefresh?.();
        } catch (e) {
            console.error(e);
            toast.error("Failed to add URLs");
        }
    };

    // --- AG GRID ---
    const defaultColDef = useMemo(() => ({resizable: true, sortable: true,}), []);


    return (
        <Paper sx={{ p: 2 }}>
            {/* Action bar */}
            <Stack direction="row" spacing={2} sx={{ mb: 2 }} alignItems="center" justifyContent="space-between">

                <Typography variant="h6">Assigned {type} links</Typography>

                <Button variant="contained" onClick={() => setAddingUrlDialog(true)}>
                    + Add URL
                </Button>
            </Stack>

            {/* TABLE */}
            <div className="ag-theme-alpine" style={{ height: 600, width: "100%" }}>
                <AgGridReact
                    rowData={links}
                    columnDefs={columnDefs}
                    defaultColDef={defaultColDef}
                    autoSizeStrategy={{
                        type: 'fitCellContents'
                    }}
                    context={{ openHistory, onDelete }}
                    pagination={true}
                    paginationPageSize={20}
                    animateRows={true}
                    groupDisplayType="groupRows"
                    rowGroupPanelShow="never"
                    loading={loading}
                    overlayLoadingTemplate={
                        `<span class="ag-overlay-loading-center">Loading ${link_type} links…</span>`
                    }
                />
            </div>

            {/* Add URL Dialog */}
            {addingUrlDialog && (
                <AddUrlDialog
                    onClose={() => setAddingUrlDialog(false)}
                    onSubmit={handleAddUrl}
                    dialogTitle={`Add ${link_type} URLs`}
                />
            )}
        </Paper>
    );
}