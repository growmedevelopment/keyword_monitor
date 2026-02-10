import { Suspense, useOptimistic, useState, startTransition } from "react";
import {Typography, Stack, Button, Paper, Chip, Box} from "@mui/material";
import tinycolor from "tinycolor2";
import toast from "react-hot-toast";
import type { KeywordGroup } from "../types/keywordTypes.ts";
import keywordGroupService from "../../services/keywordGroupService.ts";
import CreateKeywordGroupDialog from "../Dialogs/KeywordGroupDialog/CreateKeywordGroupDialog.tsx";
import ConfirmDialog from "../Common/ConfirmDialog.tsx";

interface KeywordGroupsProps {
    keywordGroups: KeywordGroup[];
    selectedGroupId?: number | null;
    onSelectGroup?: (id: number | null) => void;
}

const KeywordGroups = ({
    keywordGroups: initialKeywordGroups,
    selectedGroupId,
    onSelectGroup,
}: KeywordGroupsProps) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [realKeywordGroups, setRealKeywordGroups] = useState<KeywordGroup[]>(initialKeywordGroups);
    const [tempIdCounter, setTempIdCounter] = useState(-1);

    const [optimisticKeywordGroups, addOptimisticKeywordGroup] = useOptimistic<KeywordGroup[], KeywordGroup>(realKeywordGroups, (prev, newGroup) => [...prev, newGroup]);


    const [confirmOpen, setConfirmOpen] = useState(false);
    const [groupToDelete, setGroupToDelete] = useState<KeywordGroup | null>(null);

    const handleCreate = async (newKeywordGroupData: Omit<KeywordGroup, "id">) => {
        setDialogOpen(false);

        const tempId = tempIdCounter;
        const tempGroup: KeywordGroup = { ...newKeywordGroupData, id: tempId };

        startTransition(() => {
            setTempIdCounter((prev) => prev - 1);
            setRealKeywordGroups((prev) => [...prev, tempGroup]);
            addOptimisticKeywordGroup(tempGroup);
        });

        try {
            const response = await keywordGroupService.create(newKeywordGroupData);
            const savedGroup = response.keyword_group;

            startTransition(() => {
                setRealKeywordGroups((prev) =>
                    prev.map((group) => (group.id === tempId ? savedGroup : group))
                );
            });

        } catch (error: any) {
            startTransition(() => {
                setRealKeywordGroups((prev) => prev.filter((group) => group.id !== tempId));
            });
            toast.error(error.response?.data?.error || "Network error");
        }
    };

    const confirmDelete = (group: KeywordGroup) => {
        setGroupToDelete(group);
        setConfirmOpen(true);
    };

    const handleDeleteConfirmed = async () => {
        if (!groupToDelete) return;

        const id = groupToDelete.id;
        const oldGroups = [...realKeywordGroups];

        startTransition(() => {
            setRealKeywordGroups((prev) => prev.filter((group) => group.id !== id));
        });

        try {
            await keywordGroupService.delete(id);
            toast.success("Keyword group deleted successfully");
        } catch (error: any) {
            setRealKeywordGroups(oldGroups);
            toast.error(error.response?.data?.error || "Failed to delete keyword group");
        } finally {
            setConfirmOpen(false);
            setGroupToDelete(null);
        }
    };

    return (
        <Suspense fallback={<p>Loading...</p>}>
            <Paper sx={{ p: 2, mb: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6">Keyword groups (tags)</Typography>
                    {selectedGroupId !== null && (
                        <Button
                            size="small"
                            onClick={() => onSelectGroup?.(null)}
                            variant="text"
                            sx={{ textTransform: "none" }}
                        >
                            Clear Filter
                        </Button>
                    )}
                </Stack>

                <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 2 }}>
                    <Chip
                        label="All Keywords"
                        onClick={() => onSelectGroup?.(null)}
                        variant={selectedGroupId === null ? "filled" : "outlined"}
                        color={selectedGroupId === null ? "primary" : "default"}
                        sx={{
                            fontWeight: "bold",
                            boxShadow: selectedGroupId === null ? "rgba(100, 100, 111, 0.2) 0px 7px 29px 0px" : "none",
                        }}
                    />
                    {optimisticKeywordGroups.map((group) => {
                        const isSelected = selectedGroupId === group.id;
                        const textColor = tinycolor(group.color).isLight() ? "#000" : "#fff";
                        return (
                            <Chip
                                key={group.id}
                                label={group.name}
                                onClick={() => onSelectGroup?.(group.id)}
                                onDelete={() => confirmDelete(group)}
                                variant={isSelected ? "filled" : "outlined"}
                                sx={{
                                    boxShadow: isSelected ? "rgba(100, 100, 111, 0.2) 0px 7px 29px 0px" : "none",
                                    backgroundColor: isSelected ? group.color : "transparent",
                                    color: isSelected ? textColor : "inherit",
                                    borderColor: group.color,
                                    fontWeight: "bold",
                                    "& .MuiChip-deleteIcon": {
                                        color: isSelected ? textColor : "inherit",
                                    },
                                    "&:hover": {
                                        backgroundColor: isSelected ? tinycolor(group.color).darken(5).toString() : tinycolor(group.color).setAlpha(0.1).toString(),
                                    }
                                }}
                            />
                        );
                    })}
                </Stack>

                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        pt: 2,
                    }}
                >
                <Button variant="contained" size="small" onClick={() => setDialogOpen(true)}>
                    Create Keyword Group
                </Button>

                </Box>


                {dialogOpen && (
                    <CreateKeywordGroupDialog
                        isOpen={dialogOpen}
                        onClose={() => setDialogOpen(false)}
                        onCreate={(data) =>
                            handleCreate({
                                name: data.name,
                                color: data.color,
                                project_id: data.project_id,
                            })
                        }
                    />
                )}


                {confirmOpen && groupToDelete && (
                    <ConfirmDialog
                        open={confirmOpen}
                        title="Delete keyword group?"
                        description={
                            <>
                                Are you sure you want to delete <strong>{groupToDelete.name}</strong>?
                                This action cannot be undone.
                            </>
                        }
                        confirmLabel="Delete"
                        cancelLabel="Cancel"
                        onConfirm={handleDeleteConfirmed}
                        onCancel={() => {
                            setConfirmOpen(false);
                            setGroupToDelete(null);
                        }}
                    />
                )}
            </Paper>
        </Suspense>
    );
};

export default KeywordGroups;