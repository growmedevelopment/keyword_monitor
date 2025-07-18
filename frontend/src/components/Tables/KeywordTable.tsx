import { Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';

interface Keyword {
    keyword: string;
    results: {
        rank_absolute: number;
        url: string;
        title: string;
    }[];
}

export default function KeywordTable({ keywords }: { keywords: Keyword[] }) {
    return (
        <Table size="small" sx={{ mt: 2 }}>
            <TableHead>
                <TableRow>
                    <TableCell>Keyword</TableCell>
                    <TableCell>Position</TableCell>
                    <TableCell>Title</TableCell>
                    <TableCell>URL</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {keywords.map((kw, index) =>
                    kw.results.map((result, i) => (
                        <TableRow key={`${index}-${i}`}>
                            <TableCell>{kw.keyword}</TableCell>
                            <TableCell>{result.rank_absolute}</TableCell>
                            <TableCell>{result.title}</TableCell>
                            <TableCell>{result.url}</TableCell>
                        </TableRow>
                    ))
                )}
            </TableBody>
        </Table>
    );
}