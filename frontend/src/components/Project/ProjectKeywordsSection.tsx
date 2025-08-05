import { Paper, Stack, Typography, Button } from '@mui/material';
import KeywordTable from '../Tables/KeywordTable/KeywordTable';

interface projectKeyword{
    id: number;
    keyword: string;
    status: 'Queued' | 'Completed' | 'Submitted';
    results: {
        type: string;
        rank_absolute: number;
        rank_group: number;
        url: string;
        title: string;
    };

}

interface ProjectKeywordsSectionProps {
    keywords: projectKeyword[];
    onAddKeyword: () => void;
}

export default function ProjectKeywordsSection({keywords, onAddKeyword,}: ProjectKeywordsSectionProps) {
    return (
        <Paper sx={{ p: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Assigned Keywords</Typography>
                <Button variant="contained" size="small" onClick={onAddKeyword}>
                    Add Keyword
                </Button>
            </Stack>

            <KeywordTable keywords={keywords} />
        </Paper>
    );
}