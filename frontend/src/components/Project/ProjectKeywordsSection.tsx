import { Paper, Stack, Typography, Button } from '@mui/material';
import KeywordTable from '../Tables/KeywordTable/KeywordTable';
import type {Keyword, KeywordGroup} from "../types/keywordTypes.ts";
import {Dayjs} from "dayjs";

interface ProjectKeywordsSectionProps {
    keywords: Keyword[];
    onAddKeyword: () => void;
    keywordGroups: KeywordGroup[];
    selectedDateRange: [Dayjs, Dayjs];
}

export default function ProjectKeywordsSection({keywords, onAddKeyword, keywordGroups, selectedDateRange}: ProjectKeywordsSectionProps) {
    return (
        <Paper sx={{ p: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Assigned Keywords</Typography>
                <Button variant="contained" size="small" onClick={onAddKeyword}>
                    Add Keyword
                </Button>
            </Stack>

            <KeywordTable keywords={keywords} keywordGroups={keywordGroups} dateRange={selectedDateRange} />
        </Paper>
    );
}