import { useEffect, useState } from "react";
import linkService, { type LinkItem } from "../../services/linkService.ts";
import {
    Drawer,
    Box,
    Typography,
    Breadcrumbs,
    Link as MUILink,
    Stack,
    Chip,
    Divider,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper
} from "@mui/material";
import { useParams, Link as RouterLink } from "react-router-dom";
import pusher from "../../pusher.ts";
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import HistoryIcon from '@mui/icons-material/History';
import BackButton from "../../components/Common/BackButton.tsx";
import projectService from "../../services/projectService.ts";
import LinksTable from "../../components/Tables/LinksTable/LinksTable.tsx";




export default function ProjectLinkPage() {
    const { project : project_id , type } = useParams() as { project: string , type: 'backlinks'| 'citations' };
    const [links, setLinks] = useState<LinkItem[]>([]);
    const [projectName, setProjectName] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [historyData, setHistoryData] = useState<LinkItem | null>(null);

    const link_type = type === 'backlinks' ? 'Backlinks' : 'Citations';

    const reloadLinks = () => {
        setLoading(true);
        linkService.getLinksByType(type, project_id).then((response) => {
            setLinks(response);
            setLoading(false);
        });
    };

    const getProjectName = () => {
        projectService.getProjectName(project_id).then(res => setProjectName(res) );
    };

    useEffect(() => {
        reloadLinks();
        getProjectName();
    }, [project_id]);


    // --------------------------------------------
    // Pusher: Auto-reload backlink table on update
    // --------------------------------------------
    useEffect(() => {
        if (!project_id) return;

        const channel = pusher.subscribe(`backlinks.${project_id}`);

        channel.bind("backlink-updated", () => {
            reloadLinks();
        });

        return () => {
            channel.unbind("backlink-updated");
            pusher.unsubscribe(`backlinks.${project_id}`);
        };
    }, [project_id]);
    // --------------------------------------------


    return (
        <Box p={3}>
            <Box sx={{ mb: 3 }}>
                <Breadcrumbs aria-label="breadcrumb">
                    <MUILink component={RouterLink} to="/projects" underline="hover" color="inherit">
                        Projects
                    </MUILink>

                    <MUILink
                        component={RouterLink}
                        to={`/projects/${project_id}`}
                        underline="hover"
                        color="inherit"
                    >
                        {projectName}
                    </MUILink>

                    <Typography color="text.primary">{link_type}</Typography>
                </Breadcrumbs>
            </Box>


            <BackButton fallbackPath={`/projects/${project_id}`} />

            <LinksTable
                type={type}
                links={links}
                loading={loading}
                projectId={project_id}
                onRefresh={reloadLinks}
                onDelete={(id) => {
                    setLinks(prev => prev.filter(b => b.id !== id));
                }}
                openHistory={(item) => setHistoryData(item)}
            />

            <Drawer
                anchor="right"
                open={!!historyData}
                onClose={() => setHistoryData(null)}
                sx ={{
                    '& .MuiDrawer-paper': { width: { xs: '100%', sm: '650px' }, backgroundColor: '#f8fafc' },
                    zIndex: 100000
                }}
            >
                <Box sx={{ p: 3 }}>
                    {/* Header Section */}
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                        <Box sx={{
                            p: 1,
                            borderRadius: '10px',
                            backgroundColor: 'primary.main',
                            color: 'white',
                            display: 'flex'
                        }}>
                            <HistoryIcon />
                        </Box>
                        <Box>
                            <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e293b', lineHeight: 1.2 }}>
                                Scan History
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ wordBreak: 'break-all' }}>
                                {historyData?.url}
                            </Typography>
                        </Box>
                    </Stack>

                    <Divider sx={{ mb: 3, borderStyle: 'dashed' }} />

                    {/* Scan History Table */}
                    <TableContainer component={Paper} sx={{ borderRadius: '16px', boxShadow: "0px 4px 12px rgba(15, 23, 42, 0.03)", border: "1px solid #e2e8f0" }}>
                        <Table size="small">
                            <TableHead sx={{ bgcolor: '#f1f5f9' }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>HTTP Code</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Indexed</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Result</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {historyData?.history?.map((h, i) => {
                                    const prev = historyData.history[i + 1];
                                    const isNewer = i === 0;
                                    const indexChanged = prev && prev.indexed !== h.indexed;

                                    return (
                                        <TableRow key={i} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                            <TableCell>
                                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                    {new Date(h.checked_at).toLocaleDateString()}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {new Date(h.checked_at).toLocaleTimeString()}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={h.http_code}
                                                    size="small"
                                                    sx={{
                                                        height: '20px',
                                                        fontWeight: 700,
                                                        bgcolor: h.http_code === 200 ? '#f0fdf4' : '#fef2f2',
                                                        color: h.http_code === 200 ? '#16a34a' : '#dc2626',
                                                        borderRadius: '4px',
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Stack direction="row" alignItems="center" spacing={0.5}>
                                                    {h.indexed ? (
                                                        <CheckCircleRoundedIcon sx={{ fontSize: 16, color: '#16a34a' }} />
                                                    ) : (
                                                        <CancelRoundedIcon sx={{ fontSize: 16, color: '#dc2626' }} />
                                                    )}
                                                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                                        {h.indexed ? 'Yes' : 'No'}
                                                    </Typography>
                                                    {indexChanged && (
                                                        <Chip
                                                            label="Changed"
                                                            size="small"
                                                            color="warning"
                                                            variant="outlined"
                                                            sx={{ height: '16px', fontSize: '9px', fontWeight: 700 }}
                                                        />
                                                    )}
                                                </Stack>
                                            </TableCell>
                                            <TableCell>
                                                {isNewer && (
                                                     <Chip
                                                         label="Latest"
                                                         size="small"
                                                         color="primary"
                                                         sx={{ height: '18px', fontSize: '10px', fontWeight: 700, mb: 0.5 }}
                                                     />
                                                )}
                                                <Typography variant="caption" display="block" sx={{ maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {h.indexed ? 'Indexed' : 'Not Indexed'}
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {historyData?.history && historyData.history.length === 0 && (
                         <Box sx={{ textAlign: 'center', py: 5 }}>
                             <Typography color="text.secondary">No scan history available yet.</Typography>
                         </Box>
                    )}
                </Box>
            </Drawer>
        </Box>
    );
}