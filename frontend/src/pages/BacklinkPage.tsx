import { useEffect, useState } from "react";
import backlinkService, { type BacklinkItem } from "../services/backlinkService";
import { Drawer, Box, Typography, Breadcrumbs, Link as MUILink } from "@mui/material";
import { useParams, Link as RouterLink } from "react-router-dom";
import pusher from "../pusher";
import BacklinkTable from "../components/Tables/BacklinksTable/BacklinkTable.tsx";

export default function BacklinkPage() {
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


    return (
        <>
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

            <BacklinkTable
                backlinks={backlinks}
                loading={loading}
                projectId={project}
                onRefresh={reloadBacklinks}
                openHistory={(item) => setHistoryData(item)}
            />

            <Drawer
                anchor="right"
                open={!!historyData}
                onClose={() => setHistoryData(null)}
            >
                <Box sx={{ width: 400, padding: 3 }}>
                    <Typography variant="h5" mb={2}>
                        History for {historyData?.url}
                    </Typography>

                    {historyData?.history?.map((h, i) => (
                        <Box
                            key={i}
                            sx={{
                                borderBottom: "1px solid #eee",
                                paddingBottom: 2,
                                marginBottom: 2,
                            }}
                        >
                            <Typography>Status: {h.http_code}</Typography>
                            <Typography>Indexed: {h.indexed ? "Yes" : "No"}</Typography>
                            <Typography>
                                Checked At: {new Date(h.checked_at).toLocaleString()}
                            </Typography>
                        </Box>
                    ))}
                </Box>
            </Drawer>
        </>
    );
}