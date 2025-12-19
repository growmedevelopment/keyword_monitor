import { useMemo, useState } from "react";
import {
    Button, Paper,
    Stack, Typography,
} from "@mui/material";
import { AgGridReact } from "ag-grid-react";
import {columnDefs} from "./columns.tsx";
import type { BacklinkItem } from "../../../services/backlinkService.ts";
import backlinkService from "../../../services/backlinkService.ts";
import toast from "react-hot-toast";
import AddBacklinkUrlDialog from "../../Dialogs/BacklinkUrl/AddBacklinkUrlDialog.tsx";

interface Props {
    backlinks: BacklinkItem[];
    loading: boolean;
    onRefresh?: () => void;
    onDelete?: (id: number) => void;
    projectId: string;
    openHistory: (item: BacklinkItem) => void;
}

export default function BacklinkTable({
                                          backlinks,
                                          loading,
                                          projectId,
                                          openHistory,
                                          onRefresh,
                                          onDelete,
                                      }: Props) {
    const [addingUrlDialog, setAddingUrlDialog] = useState(false);

    const handleAddUrl = async (urls: string[]) => {
        try {
            const response = await backlinkService.create(projectId, urls);
            toast.success(response.message);
            onRefresh?.();
        } catch (e) {
            console.error(e);
            toast.error("Failed to add URLs");
        }
    };


    // --- AG GRID ---
    const defaultColDef = useMemo(
        () => ({
            resizable: true,
            sortable: true,
            flex: 1,
            minWidth: 120,
        }),
        []
    );


    return (
        <Paper sx={{ p: 2 }}>
            {/* Action bar */}
            <Stack direction="row" spacing={2} sx={{ mb: 2 }} alignItems="center" justifyContent="space-between">

                <Typography variant="h6">Assigned Backlinks</Typography>

                <Button variant="contained" onClick={() => setAddingUrlDialog(true)}>
                    + Add URL
                </Button>
            </Stack>

            {/* TABLE */}
            <div className="ag-theme-alpine" style={{ height: 600, width: "100%" }}>
                <AgGridReact
                    rowData={backlinks}
                    columnDefs={columnDefs}
                    defaultColDef={defaultColDef}
                    context={{ openHistory, onDelete }}
                    pagination={true}
                    paginationPageSize={20}
                    animateRows={true}
                    groupDisplayType="groupRows"
                    rowGroupPanelShow="never"
                    loading={loading}
                    overlayLoadingTemplate={
                        `<span class="ag-overlay-loading-center">Loading backlinks…</span>`
                    }
                />
            </div>

            {/* Add URL Dialog */}
            {addingUrlDialog && (
                <AddBacklinkUrlDialog
                    onClose={() => setAddingUrlDialog(false)}
                    onSubmit={handleAddUrl}
                />
            )}
        </Paper>
    );
}