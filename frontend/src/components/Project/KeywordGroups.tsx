import { Suspense, useOptimistic, useState, startTransition } from 'react';
import { Typography, Stack, Button, Paper } from '@mui/material';
import KeywordGroupsTable from '../Tables/KeywordGroupsTable/KeywordGroupsTable.tsx';
import CreateKeywordGroupDialog from '../Dialogs/KeywordGroupDialog/CreateKeywordGroupDialog.tsx';
import type { KeywordGroup } from '../types/keywordTypes.ts';
import keywordGroupService from "../../services/keywordGroupService.ts";
import toast from "react-hot-toast";

interface KeywordGroupsProps {
    keywordGroups: KeywordGroup[]
}

const KeywordGroups = ({ keywordGroups: initialKeywordGroups }: KeywordGroupsProps) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [realKeywordGroups, setRealKeywordGroups] = useState<KeywordGroup[]>(initialKeywordGroups);
    const [tempIdCounter, setTempIdCounter] = useState(-1);

    // optimistic state
    const [optimisticKeywordGroups, addOptimisticKeywordGroup] = useOptimistic<KeywordGroup[], KeywordGroup>(realKeywordGroups, (prev, newGroup) => [...prev, newGroup]);

    const handleCreate = async (newKeywordGroupData: Omit<KeywordGroup, "id">) => {
        setDialogOpen(false);

        const tempId = tempIdCounter;
        const tempGroup: KeywordGroup = { ...newKeywordGroupData, id: tempId };


        startTransition(() => {
            setTempIdCounter(prev => prev - 1);
            setRealKeywordGroups(prev => [...prev, tempGroup]);
            addOptimisticKeywordGroup(tempGroup);
        });

        try {
            const response = await keywordGroupService.create(newKeywordGroupData);
            const savedGroup = response.keyword_group;


            startTransition(() => {
                setRealKeywordGroups(prev =>
                    prev.map(group => (group.id === tempId ? savedGroup : group))
                );
            });

        } catch (error: any) {

            startTransition(() => {
                setRealKeywordGroups(prev =>
                    prev.filter(group => group.id !== tempId)
                );
            });

            toast.error(error.response?.data?.error || "Network error");

        }
    };

    return (
        <Suspense fallback={<p>Loading...</p>}>
            <Paper sx={{ p: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6">Keyword groups (tags)</Typography>
                    <Button variant="contained" size="small" onClick={() => setDialogOpen(true)}>
                        Create Keyword Group
                    </Button>
                </Stack>

                {/* show optimistic groups in the table */}
                <KeywordGroupsTable keywordGroups={optimisticKeywordGroups} />

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
            </Paper>
        </Suspense>
    );
};

export default KeywordGroups;