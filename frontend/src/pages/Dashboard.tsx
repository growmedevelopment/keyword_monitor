import { Box, Card, CardContent, Typography } from '@mui/material';

export default function Dashboard() {
    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Dashboard
            </Typography>

            <Box
                sx={{
                    display: 'grid',
                    gap: 2,
                    gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                }}
            >
                <Card elevation={3}>
                    <CardContent>
                        <Typography variant="h6">Keyword Stats</Typography>
                        <Typography variant="body2" color="text.secondary">
                            Total Keywords: 123
                        </Typography>
                    </CardContent>
                </Card>

                <Card elevation={3}>
                    <CardContent>
                        <Typography variant="h6">Top Project</Typography>
                        <Typography variant="body2" color="text.secondary">
                            Project: example.com
                        </Typography>
                    </CardContent>
                </Card>
            </Box>
        </Box>
    );
}