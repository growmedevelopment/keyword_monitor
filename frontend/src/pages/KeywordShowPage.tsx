import { Box, Typography, Paper } from "@mui/material";
import type { Keyword } from "../components/types/keywordTypes.ts";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import keywordService from "../services/keywordService.ts";
import KeywordRankGrid from "../components/Tables/KeywordRankTable/KeywordRankGrid.tsx";
import DataStateHandler from "../components/Common/DataStateHandler.tsx"; // Reusable component

export default function KeywordShowPage() {
    const { id } = useParams<{ id: string }>();
    const [keyword, setKeyword] = useState<Keyword | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;

        keywordService
            .getById(id)
            .then(setKeyword)
            .catch(() => setError("Failed to load keyword"))
            .finally(() => setLoading(false));
    }, [id]);

    return (
        <DataStateHandler<Keyword>
            loading={loading}
            error={error}
            data={keyword}
            emptyMessage="No keyword found"
        >
            {(keywordData) => (
                <Box p={3}>
                    <Typography variant="h4" gutterBottom>
                        {keywordData.keyword}
                    </Typography>

                    {/* Rankings Table */}
                    <Paper sx={{ mt: 3 }}>
                        <KeywordRankGrid data={keywordData.keywords_rank ?? []} />
                    </Paper>
                </Box>
            )}
        </DataStateHandler>
    );
}