import { useMemo, useState } from "react";
import {
    Box,
    Button,
    TextField,
    Stack,
} from "@mui/material";
import { AgGridReact } from "ag-grid-react";
import { buildBacklinkColumnDefs } from "./columns";
import type { BacklinkItem } from "../../services/backlinkService";
import backlinkService from "../../services/backlinkService";
import toast from "react-hot-toast";
import AddBacklinkUrlDialog from "../Dialogs/BacklinkUrl/AddBacklinkUrlDialog.tsx";

interface Props {
    backlinks: BacklinkItem[];
    loading: boolean;
    onRefresh?: () => void;
    projectId: string;
    openHistory: (item: BacklinkItem) => void;
}

export default function BacklinkTable({
                                          backlinks,
                                          loading,
                                          projectId,
                                          openHistory,
                                          onRefresh,
                                      }: Props) {
    const [search, setSearch] = useState("");
    const [addingUrlDialog, setAddingUrlDialog] = useState(false);

    const handleAddUrl = async (urls: string[]) => {
        try {
            await backlinkService.create(projectId, urls);
            toast.success("URLs added successfully!");
            onRefresh?.();                 // FIXED
        } catch (e) {
            console.error(e);
            toast.error("Failed to add URLs");
        }
    };

    const handleDelete = async (id: number) => {
        console.log("Deleting backlink with id: ", id);
    }

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

    const columnDefs = useMemo(() => {
        const cols = buildBacklinkColumnDefs();

        // Add Delete button
        cols.push({
            headerName: "Delete",
            width: 120,
            sortable: false,
            filter: false,
            cellRenderer: (p: any) => (
                <button
                    style={{
                        padding: "6px 12px",
                        background: "#f44336",
                        color: "white",
                        border: "none",
                        borderRadius: 6,
                        cursor: "pointer",
                    }}
                    onClick={() => handleDelete(p.data.id)}
                >
                    Remove
                </button>
            ),
        });

        return cols;
    }, []);

    const filteredData = backlinks.filter((row) =>
        row.url.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <Box>
            {/* Action bar */}
            <Stack direction="row" spacing={2} sx={{ mb: 2 }} alignItems="center">
                <TextField
                    label="Search URL"
                    size="small"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    sx={{ width: 300 }}
                />

                <Button variant="contained" onClick={() => setAddingUrlDialog(true)}>
                    + Add URL
                </Button>
            </Stack>

            {/* TABLE */}
            <div className="ag-theme-alpine" style={{ height: 600, width: "100%" }}>
                <AgGridReact
                    rowData={filteredData}
                    columnDefs={columnDefs}
                    defaultColDef={defaultColDef}
                    context={{ openHistory }}
                    pagination={true}
                    paginationPageSize={20}
                    animateRows={true}
                    groupDisplayType="groupRows"
                    rowGroupPanelShow="always"
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
        </Box>
    );
}