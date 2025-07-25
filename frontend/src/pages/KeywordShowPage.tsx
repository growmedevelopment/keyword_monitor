import { Box, Skeleton, Typography, Paper } from "@mui/material";
import type { Keyword } from "../components/types/keywordTypes.ts";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import keywordService from "../services/keywordService.ts";
import KeywordRankGrid from "../components/Tables/KeywordRankTable/KeywordRankGrid.tsx";

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
            .catch((err) => {
                console.error("Failed to fetch keyword", err);
                setError("Failed to load keyword");
            })
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) {
        return (
            <Box p={3}>
                <Skeleton variant="text" width={200} height={40} />
                <Skeleton variant="rectangular" height={120} sx={{ mt: 2 }} />
            </Box>
        );
    }

    if (error) return <Typography color="error">{error}</Typography>;
    if (!keyword) return <Typography>No keyword found</Typography>;

    return (
        <Box p={3}>
            <Typography variant="h4" gutterBottom>
                {keyword.keyword}
            </Typography>

            {/* Rankings Table */}
            <Paper sx={{ mt: 3 }}>
                <KeywordRankGrid data={keyword.keywords_rank ?? []} />
            </Paper>
        </Box>
    );
}