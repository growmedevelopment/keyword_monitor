import { Box, Skeleton, Typography, Table, TableHead, TableRow, TableCell, TableBody, Paper } from "@mui/material";
import type { Keyword } from "../components/types/keywordTypes.ts";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import keywordService from "../services/keywordService.ts";
import dayjs from "dayjs";

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
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Date</TableCell>
                            <TableCell>Position</TableCell>
                            <TableCell>URL</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {keyword.keywords_rank?.map((rank, index) => (
                            <TableRow key={index}>
                                <TableCell>
                                    {dayjs(rank.tracked_at).format("YYYY-MM-DD")}
                                </TableCell>
                                <TableCell>{rank.position}</TableCell>
                                <TableCell>
                                    <a
                                        href={rank.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        {rank.url}
                                    </a>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Paper>
        </Box>
    );
}