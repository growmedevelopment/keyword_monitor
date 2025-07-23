import { Table, TableHead, TableRow, TableCell, TableBody, Typography, Skeleton } from '@mui/material';
import type {Keyword} from "../types/keywordTypes.ts";


export default function KeywordTable({ keywords }: { keywords: Keyword[] }) {
    if (!keywords || keywords.length === 0) {
        return <Typography>No keywords added yet.</Typography>;
    }

    return (
        <Table size="small" sx={{ mt: 2 }}>
            <TableHead>
                <TableRow>
                    <TableCell>Keyword</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Position</TableCell>
                    <TableCell>Title</TableCell>
                    <TableCell>URL</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {keywords.map((kw, index) => {
                    const isLoading = kw.status !== 'Completed';

                    // If Completed but results empty, show placeholder
                    const results = kw.results.length > 0 ? kw.results : [
                        { rank_group: 0, url: '-', title: '-' }
                    ];

                    return results.map((result, i) => (
                        <TableRow key={`${index}-${i}`}>
                            {/* Keyword */}
                            <TableCell>{kw.keyword}</TableCell>

                            {/* Status */}
                            <TableCell>
                                <Typography variant="body2" color={isLoading ? 'warning.main' : 'success.main'}>{kw.status}</Typography>
                            </TableCell>

                            {/* Rank (Position) */}
                            <TableCell>{isLoading ? (<Skeleton width={30} />) : (result.rank_group || '-')}</TableCell>

                            {/* Title */}
                            <TableCell>{isLoading ? (<Skeleton width="70%" />) : (result.title)}</TableCell>

                            {/* URL */}
                            <TableCell>{isLoading ? (<Skeleton width="80%" />) : (
                                    <a
                                        href={result.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ color: '#1976d2', textDecoration: 'none' }}
                                    >
                                        {result.url}
                                    </a>
                                )}
                            </TableCell>
                        </TableRow>
                    ));
                })}
            </TableBody>
        </Table>
    );
}