import {Suspense, useEffect, useOptimistic, useState} from 'react';
import {Typography, Stack, Button} from '@mui/material';
import toast from 'react-hot-toast';
import keywordGroupService from '../services/keywordGroupService.ts';
import KeywordGroupsTable from '../components/Tables/KeywordGroupsTable/KeywordGroupsTable.tsx';
import CreateKeywordGroupDialog from '../components/Dialogs/KeywordGroupDialog/CreateKeywordGroupDialog.tsx';
import type { KeywordGroup } from '../components/types/keywordTypes.ts';

const KeywordGroupsPage = () => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [realKeywordGroups, setRealKeywordGroups] = useState<KeywordGroup[]>([]);

    const refreshGroups = async () => {
        try {
            const groups = await keywordGroupService.getAll();
            setRealKeywordGroups(groups);
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to refresh keyword groups.');
        }
    };

    useEffect(() => {
        refreshGroups().then();
    }, []);

    const [optimisticKeywordGroup] = useOptimistic<KeywordGroup[], KeywordGroup>(
        realKeywordGroups,
        (prev, newGroup) => [...prev, newGroup]
    );

    return (
        <Suspense fallback={<p>Loading...</p>}>
            <Stack spacing={2}>
                <Typography variant="h4" sx={{ fontWeight: 700, letterSpacing: 0.2 }}>
                    Keyword groups (tags)
                </Typography>

                <KeywordGroupsTable keywordGroups={optimisticKeywordGroup} />

                <Button variant="contained" onClick={() => setDialogOpen(true)}>
                    Create New Keyword Group
                </Button>

                {dialogOpen && (
                    <CreateKeywordGroupDialog
                        isOpen={dialogOpen}
                        onClose={() => setDialogOpen(false)}
                        onCreate={refreshGroups}
                    />
                )}
            </Stack>
        </Suspense>
    );
};

export default KeywordGroupsPage;