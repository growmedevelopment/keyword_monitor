import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
    Box, Typography, Paper, Table, TableBody, TableCell, TableHead,
    TableRow, TextField, Button
} from '@mui/material';
import projectService  from '../services/projectService';


interface Project {
    id: number;
    name: string;
    url: string;
    keywords: string[];
}

export default function ProjectShowPage() {
    const { id } = useParams<{ id: string }>();
    const [project, setProject] = useState<Project | null>(null);
    // const [newKeyword, setNewKeyword] = useState('');

    useEffect(() => {
        if (!id) return;
        projectService.getById(id).then((response) => {
            console.log(response);
        })


        // Replace this with actual API call
        // const fetchProject = async () => {
        //     const data: Project = {
        //         id: Number(id),
        //         name: 'Example Project',
        //         url: 'https://example.com',
        //         keywords: ['seo audit', 'keyword research', 'on-page optimization']
        //     };
        //     setProject(data);
        // };
        //
        // fetchProject().then();
    }, []);

    // const handleAddKeyword = () => {
    //     if (!newKeyword.trim()) return;
    //     setProject(prev =>
    //         prev ? { ...prev, keywords: [...prev.keywords, newKeyword.trim()] } : prev
    //     );
    //     setNewKeyword('');
    // };

    if (!project) return <Typography>Loading...</Typography>;

    return (
        <Box p={3}>
            <Typography variant="h4" gutterBottom>{project.name}</Typography>
            <Typography variant="subtitle1" gutterBottom color="text.secondary">
                {project.url}
            </Typography>

            <Paper sx={{ mt: 3, p: 2 }}>
                <Typography variant="h6">Assigned Keywords</Typography>

                <Table size="small" sx={{ mt: 2 }}>
                    <TableHead>
                        <TableRow>
                            <TableCell>#</TableCell>
                            <TableCell>Keyword</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {project.keywords.map((kw, index) => (
                            <TableRow key={index}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>{kw}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                {/*<Box display="flex" gap={2} mt={2}>*/}
                {/*    <TextField*/}
                {/*        label="New Keyword"*/}
                {/*        variant="outlined"*/}
                {/*        size="small"*/}
                {/*        value={newKeyword}*/}
                {/*        onChange={(e) => setNewKeyword(e.target.value)}*/}
                {/*        onKeyDown={(e) => e.key === 'Enter' && handleAddKeyword()}*/}
                {/*    />*/}
                {/*    <Button variant="contained" onClick={handleAddKeyword}>Add Keyword</Button>*/}
                {/*</Box>*/}
            </Paper>
        </Box>
    );
}