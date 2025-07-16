'use client'

import { use } from 'react'
import { Box, Grid, Typography, Card, CardContent } from '@mui/material'

async function fetchProjects() {
    const res = await fetch('http://localhost:8000/api/projects', {
        headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
        },
        cache: 'no-store', // disables caching in Next.js
    })

    if (!res.ok) throw new Error('Failed to fetch projects')
    return res.json()
}

export default function ProjectsPage() {
    const projects = use(fetchProjects())

    return (
        <Box sx={{ flexGrow: 1, p: 3 }}>
            <Typography variant="h4" gutterBottom>
                All Projects
            </Typography>

            <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                {projects.map((project: any) => (
                    <Grid key={project.id} size={{ xs: 4, sm: 4, md: 4 }}>
                        <Card sx={{ height: '100%' }}>
                            <CardContent>
                                <Typography variant="h6">{project.name}</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {project.domain}
                                </Typography>
                                <Typography variant="caption" display="block">
                                    Created: {new Date(project.created_at).toLocaleDateString()}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    )
}