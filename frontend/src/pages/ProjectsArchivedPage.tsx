import {useEffect, useMemo, useState} from "react";
import {
    Box,
    Card,
    CardActions,
    CardContent,
    Chip,
    Divider,
    Grid,
    InputAdornment,
    Link,
    Skeleton,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import RestoreIcon from "@mui/icons-material/Restore";
import SearchIcon from "@mui/icons-material/Search";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import FolderIcon from "@mui/icons-material/Folder";
import projectService from "../services/projectService";
import type {Project} from "../components/types/projectTypes";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import ConfirmActionButton from "../components/Tables/ConfirmDeleteButton"


export default function ProjectsArchivedPage() {
    const [archived, setArchived] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [restoringId, setRestoringId] = useState<number | null>(null);
    const [query, setQuery] = useState("");

    useEffect(() => {
        let mounted = true;
        projectService
            .getArchived()
            .then((projects) => {
                if (mounted) setArchived(projects);
            })
            .catch((error) => {
                toast.error(error?.response?.data?.message || "Failed to fetch archived projects.");
            })
            .finally(() => {
                if (mounted) setLoading(false);
            });
        return () => {
            mounted = false;
        };
    }, []);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return archived;
        return archived.filter((p) =>
            [p.name, p.url, p.location_name, p.country]
                .filter(Boolean)
                .some((v) => String(v).toLowerCase().includes(q))
        );
    }, [archived, query]);

    const handleRestore = async (id: number) => {
        setRestoringId(id);
        // optimistic remove
        const prev = archived;
        setArchived((arr) => arr.filter((p) => p.id !== id));
        try {
            const response = await projectService.restore(id);
             toast.success(response.message);
        } catch (err: any) {
            // rollback
            setArchived(prev);
            toast.error(err?.response?.data?.message || "Restore failed");
        } finally {
            setRestoringId(null);
        }
    };

    return (
        <Box sx={{py: 3}}>
            {/* Header */}
            <Stack direction={{xs: "column", sm: "row"}} spacing={2} alignItems={{xs: "flex-start", sm: "center"}}
                   justifyContent="space-between" sx={{mb: 2}}>
                <Stack spacing={0.5}>
                    <Typography variant="h4" fontWeight={700} letterSpacing={0.2}>
                        Archived Projects
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Restore previously archived projects. Use search to quickly find what you need.
                    </Typography>
                </Stack>

                <Stack direction="row" spacing={1} alignItems="center" sx={{width: {xs: "100%", sm: "auto"}}}>
                    <TextField
                        size="small"
                        placeholder="Search archived…"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon fontSize="small"/>
                                    </InputAdornment>
                                ),
                            },
                        }}
                        sx={{minWidth: {xs: "100%", sm: 260}}}
                    />
                </Stack>
            </Stack>

            <Divider sx={{mb: 3}}/>

            {/* Content */}
            {loading ? (
                // Skeleton grid
                <Grid container spacing={2}>
                    {Array.from({length: 6}).map((_, i) => (
                        <Grid size={{xs: 12, sm: 6, md: 4}} key={i}>
                            <Card sx={{p: 2}}>
                                <Skeleton variant="text" width="60%" height={28}/>
                                <Skeleton variant="text" width="40%"/>
                                <Skeleton variant="rounded" height={80} sx={{mt: 1}}/>
                                <Stack direction="row" justifyContent="flex-end" sx={{mt: 2}}>
                                    <Skeleton variant="rounded" width={96} height={36}/>
                                </Stack>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            ) : filtered.length === 0 ? (
                // Empty state
                <Card
                    variant="outlined"
                    sx={{
                        p: {xs: 3, md: 5},
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        textAlign: "center",
                        minHeight: 220,
                    }}
                >
                    <Stack spacing={2} alignItems="center">
                        <Box
                            sx={{
                                width: 96,
                                height: 96,
                                borderRadius: "50%",
                                bgcolor: (t) =>
                                    t.palette.mode === "light" ? t.palette.grey[100] : t.palette.grey[900],
                                display: "grid",
                                placeItems: "center",
                            }}
                        >
                            <FolderIcon fontSize="large"/>
                        </Box>
                        <Typography variant="h6">No archived projects found</Typography>
                        <Typography variant="body2" color="text.secondary" maxWidth={520}>
                            {archived.length === 0 && !query
                                ? "You don’t have any archived projects yet."
                                : "No archived projects match your search."}
                        </Typography>
                    </Stack>
                </Card>
            ) : (
                // Cards grid
                <Grid container spacing={2}>
                    {filtered.map((project) => (

                        <Grid size={{xs: 12, sm: 6, md: 4}} key={project.id}>
                            <Card
                                variant="outlined"
                                sx={{
                                    height: "100%",
                                    display: "flex",
                                    flexDirection: "column",
                                    borderRadius: 2,
                                }}
                            >
                                <CardContent sx={{pb: 1.5}}>
                                    <Stack spacing={1}>
                                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                            <Typography variant="h6"
                                                        sx={{wordBreak: "break-word"}}>{project.name}</Typography>
                                            <Chip
                                                size="small"
                                                label="Archived"
                                                color="default"
                                                sx={{ml: 1}}
                                                variant="outlined"
                                            />
                                        </Stack>

                                        <Typography variant="body2" color="blue" sx={{wordBreak: "break-all"}}>
                                            <Link
                                                href={project.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                underline="hover"
                                                color="inherit"
                                            >
                                                {project.url}
                                            </Link>
                                        </Typography>

                                        <Stack direction="row" spacing={1} alignItems="center" color="text.secondary">
                                            <CalendarMonthIcon fontSize="small"/>
                                            <Typography variant="caption">
                                                Archived on{" "}
                                                {project.deleted_at
                                                    ? dayjs(project.deleted_at).format("MMMM D, YYYY")
                                                    : "—"}
                                            </Typography>
                                        </Stack>

                                        <Stack direction="row" spacing={1}>
                                            {project.location_name &&
                                                <Chip size="small" label={project.location_name}/>}
                                            {project.country &&
                                                <Chip size="small" variant="outlined" label={project.country}/>}
                                        </Stack>
                                    </Stack>
                                </CardContent>

                                <Box sx={{flexGrow: 1}}/>

                                <CardActions sx={{pt: 0.5, px: 2, pb: 2}}>
                                    <ConfirmActionButton
                                        variant="button"
                                        color="primary"
                                        icon={<RestoreIcon />}
                                        confirmLabel="Restore"
                                        title="Restore project?"
                                        description="This will unarchive the project and return it to your active list."
                                        tooltip="Restore"
                                        ariaLabel="restore-project"
                                        disabled={restoringId !== null}
                                        onConfirm={() => handleRestore(project.id)}
                                    >
                                        Restore
                                    </ConfirmActionButton>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

        </Box>
    );
}