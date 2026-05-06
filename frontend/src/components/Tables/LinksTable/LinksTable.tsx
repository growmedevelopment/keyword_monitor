import { useMemo, useState } from "react";
import {
    Button, Grid, Paper,
    Stack, Typography,
} from "@mui/material";
import { AgGridReact } from "ag-grid-react";
import {columnDefs} from "./columns.tsx";
import type { LinkItem } from "../../../services/linkService.ts";
import linkService from "../../../services/linkService.ts";
import toast from "react-hot-toast";
import AddUrlDialog from "../../Dialogs/AddUrl/AddUrlDialog.tsx";
import ErrorToast from "../../Dialogs/Notification/ErrorToast.tsx";
import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import ExportLinksButton from "./ExportLinksButton.tsx";

interface Props {
    type: 'backlinks' | 'citations';
    links: LinkItem[];
    loading: boolean;
    onRefresh?: () => void;
    onAdded?: (items: LinkItem[]) => void;
    onDelete?: (id: number) => void;
    projectId: string;
    openHistory: (item: LinkItem) => void;
}

const SkippedUrlsList = ({ urls }: { urls: string[] }) => (
    <div style={{ textAlign: 'left' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
            Some URLs were skipped (already exist in table):
        </div>
        <ul style={{
            margin: 0,
            paddingLeft: '20px',
            fontSize: '12px',
            wordBreak: 'break-all'
        }}>
            {urls.map((url, index) => (
                <li key={index} style={{ marginBottom: '4px' }}>
                    {url}
                </li>
            ))}
        </ul>
    </div>
);

export default function LinksTable({type, links, loading, projectId, openHistory, onRefresh, onAdded, onDelete}: Props) {
    const [addingUrlDialog, setAddingUrlDialog] = useState(false);
    const link_type = type === 'backlinks' ? 'Backlinks' : 'Citations';

    const handleAddUrl = async (urls: string[]) => {
        toast.success("URLs sent for processing. Please wait for the results.");
        setAddingUrlDialog(false);
        try {
            const response = await linkService.create(projectId, urls, type);
            toast.success(response.message);
            onAdded?.(response.data.added_urls);
            if (response.data.skipped_urls.length > 0) {
                toast.custom(
                    (toastInstance) => (
                        <ErrorToast
                            toastInstance={toastInstance}
                            message={<SkippedUrlsList urls={response.data.skipped_urls} />}
                        />
                    ),
                    { duration: Infinity },
                );
            }
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

                <Grid spacing={2} container alignItems="center" justifyContent="flex-end" >
                    <ExportLinksButton
                        links={links}
                        type={type}
                        disabled={links.length < 1}
                    />

                    <Button
                        variant="outlined"
                        disabled={links.length < 1}
                        sx={{display: 'flex', alignContent: 'center', alignItems: 'center', gap: '5px'}}
                        onClick={()=>{
                            linkService.reCheckAllLinks(projectId, type).then(
                                (response) => {
                                    toast.success(response.message || "Rechecking all links started.");
                                    onRefresh?.();
                                },
                                () => toast.error("Failed to recheck all links.")
                            )
                    }}>
                        <RotateLeftIcon/> <span>Recheck all links </span>
                    </Button>

                    <Button variant="contained" onClick={() => setAddingUrlDialog(true)}>
                        + Add URL
                    </Button>
                </Grid>

            </Stack>

            {/* TABLE */}
            <div className="ag-theme-alpine" style={{ height: 900, width: "100%" }}>
                <AgGridReact
                    rowData={links}
                    columnDefs={columnDefs}
                    defaultColDef={defaultColDef}
                    getRowId={({ data }) => String(data.id)}
                    context={{ openHistory, onDelete, projectId}}
                    pagination={true}
                    paginationPageSize={20}
                    animateRows={false}
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
