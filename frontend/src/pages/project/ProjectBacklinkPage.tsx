import { useEffect, useState } from "react";
import backlinkService, { type BacklinkItem } from "../../services/backlinkService.ts";
import {Drawer, Box, Typography, Breadcrumbs, Link as MUILink, Stack, Chip, Divider,} from "@mui/material";
import { useParams, Link as RouterLink } from "react-router-dom";
import pusher from "../../pusher.ts";
import BacklinkTable from "../../components/Tables/BacklinksTable/BacklinkTable.tsx";
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import LanguageIcon from '@mui/icons-material/Language';
import HistoryIcon from '@mui/icons-material/History';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import BackButton from "../../components/Common/BackButton.tsx";


interface StatusBadgeProps {
    icon: React.ReactNode;
    label: string;
    active: boolean | number | undefined;
}

export default function ProjectBacklinkPage() {
    const { project } = useParams() as { project: string };

    const [backlinks, setBacklinks] = useState<BacklinkItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [historyData, setHistoryData] = useState<BacklinkItem | null>(null);

    const reloadBacklinks = () => {
        setLoading(true);
        backlinkService.getAll(project).then((res) => {
            setBacklinks(res.backlinks);
            setLoading(false);
        });
    };

    useEffect(() => {
        reloadBacklinks();
    }, [project]);


    // --------------------------------------------
    // Pusher: Auto-reload backlink table on update
    // --------------------------------------------
    useEffect(() => {
        if (!project) return;

        const channel = pusher.subscribe(`backlinks.${project}`);

        channel.bind("backlink-updated", () => {
            reloadBacklinks();
        });

        return () => {
            channel.unbind("backlink-updated");
            pusher.unsubscribe(`backlinks.${project}`);
        };
    }, [project]);
    // --------------------------------------------

    const StatusBadge = ({ icon, label, active } : StatusBadgeProps) => (
        <Stack direction="row" alignItems="center" spacing={0.5} sx={{
            px: 1, py: 0.5, borderRadius: '6px', border: '1px solid',
            borderColor: active ? '#dcfce7' : '#f1f5f9',
            bgcolor: active ? '#f0fdf4' : '#f8fafc',
            color: active ? '#16a34a' : '#94a3b8'
        }}>
            {icon}
            <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '11px' }}>{label}</Typography>
            {active ? <CheckCircleRoundedIcon sx={{ fontSize: 12 }} /> : <CancelRoundedIcon sx={{ fontSize: 12 }} />}
        </Stack>
    );

    return (
        <Box p={3}>
            <Box sx={{ mb: 3 }}>
                <Breadcrumbs aria-label="breadcrumb">
                    <MUILink component={RouterLink} to="/projects" underline="hover" color="inherit">
                        Projects
                    </MUILink>

                    <MUILink
                        component={RouterLink}
                        to={`/projects/${project}`}
                        underline="hover"
                        color="inherit"
                    >
                        Project #{project}
                    </MUILink>

                    <Typography color="text.primary">Backlinks</Typography>
                </Breadcrumbs>
            </Box>


            <BackButton fallbackPath={`/projects/${project}`} />

            <BacklinkTable
                backlinks={backlinks}
                loading={loading}
                projectId={project}
                onRefresh={reloadBacklinks}
                onDelete={(id) => {
                    setBacklinks(prev => prev.filter(b => b.id !== id));
                }}
                openHistory={(item) => setHistoryData(item)}
            />

            <Drawer
                anchor="right"
                open={!!historyData}
                onClose={() => setHistoryData(null)}
                sx ={{width: {xs: '100%', sm: 0}, backgroundColor: '#f8fafc', zIndex: 100000}}
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

                    {/* Timeline of History Cards */}
                    <Box sx={{ position: 'relative' }}>
                        {/* The Vertical Line for the Timeline */}
                        <Box sx={{
                            position: 'absolute',
                            left: '19px',
                            top: 0,
                            bottom: 0,
                            width: '2px',
                            backgroundColor: '#e2e8f0',
                            zIndex: 0
                        }} />

                        {historyData?.history?.map((h, i) => (
                            <Box
                                key={i}
                                sx={{
                                    position: 'relative',
                                    pl: 6,
                                    pb: 4,
                                    zIndex: 1
                                }}
                            >
                                {/* Timeline Dot - Green if Indexed and HTTP 200, else Gray/Red */}
                                <Box sx={{
                                    position: 'absolute',
                                    left: '11px',
                                    top: '4px',
                                    width: '18px',
                                    height: '18px',
                                    borderRadius: '50%',
                                    backgroundColor: h.indexed && h.http_code === 200 ? '#10b981' : '#cbd5e1',
                                    border: '4px solid #fff',
                                    boxShadow: '0 0 0 2px #e2e8f0'
                                }} />

                                <Box sx={{
                                    p: 2,
                                    borderRadius: '16px',
                                    backgroundColor: '#fff',
                                    border: "1px solid #e2e8f0",
                                    boxShadow: "0px 4px 12px rgba(15, 23, 42, 0.03)",
                                    transition: "all 0.2s",
                                    "&:hover": {
                                        transform: 'translateY(-2px)',
                                        boxShadow: "0px 8px 16px rgba(15, 23, 42, 0.06)",
                                        borderColor: '#cbd5e1'
                                    }
                                }}>
                                    {/* Top Row: Page Status */}
                                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#334155' }}>
                                            {h.http_code === 200 ? 'Successfully Scanned' : 'Connection Issue'}
                                        </Typography>

                                        <Chip
                                            label={`Code: ${h.http_code}`}
                                            size="small"
                                            sx={{
                                                height: '22px',
                                                fontWeight: 700,
                                                bgcolor: h.http_code === 200 ? '#f0fdf4' : '#fef2f2',
                                                color: h.http_code === 200 ? '#16a34a' : '#dc2626',
                                                borderRadius: '6px',
                                                border: '1px solid',
                                                borderColor: h.http_code === 200 ? '#dcfce7' : '#fee2e2'
                                            }}
                                        />
                                    </Stack>

                                    {/* Indexing Status Badge */}
                                    <Box sx={{ mb: 2 }}>
                                        <StatusBadge
                                            icon={<LanguageIcon fontSize="inherit" />}
                                            label="Google Index Status"
                                            active={h.indexed}
                                        />
                                    </Box>

                                    {/* Detailed Info Box */}
                                    <Box sx={{
                                        bgcolor: '#f8fafc',
                                        p: 1.5,
                                        borderRadius: '10px',
                                        border: '1px solid #e2e8f0'
                                    }}>
                                        <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                                            <AccessTimeIcon sx={{ fontSize: 14, color: '#64748b' }} />
                                            <Typography variant="caption" sx={{ color: '#475569', fontWeight: 600 }}>
                                                Checked on {new Date(h.checked_at).toLocaleDateString()} at {new Date(h.checked_at).toLocaleTimeString()}
                                            </Typography>
                                        </Stack>

                                        <Typography variant="caption" sx={{
                                            color: h.indexed ? '#475569' : '#92400e',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1,
                                            fontWeight: 500
                                        }}>
                                            <Box sx={{
                                                width: 6,
                                                height: 6,
                                                borderRadius: '50%',
                                                bgcolor: h.indexed ? '#10b981' : '#f59e0b'
                                            }} />
                                            {h.indexed
                                                ? "This URL is indexed and contributing to your SEO profile."
                                                : "This URL is not currently found in Google's search results."}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                        ))}
                    </Box>
                </Box>
            </Drawer>
        </Box>
    );
}