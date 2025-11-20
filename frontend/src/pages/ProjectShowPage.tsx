import {useCallback, useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import {Box, CircularProgress, Grid, Typography} from "@mui/material";
import pusher from "../pusher";
import projectService from "../services/projectService";
import keywordService from "../services/keywordService.ts";
import AddKeywordDialog from "../components/Dialogs/AddKeywordDialog/AddKeywordDialog.tsx";
import type {Project} from "../components/types/projectTypes";
import ProjectDetails from "../components/Project/ProjectDetails.tsx";
import ProjectKeywordsSection from "../components/Project/ProjectKeywordsSection.tsx";
import DataStateHandler from "../components/Common/DataStateHandler.tsx";
import toast from "react-hot-toast";
import KeywordGroups from "../components/Project/KeywordGroups.tsx";
import BackButton from "../components/Common/BackButton.tsx";
import Rechart from "../components/Project/SeoPerformanceRechart/Rechart.tsx";
import dayjs, {type Dayjs} from "dayjs";


export default function ProjectShowPage() {
    const {id} = useParams<{ id: string }>();
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isDialogOpen, setDialogOpen] = useState(false);
    const [addingKeywords, setAddingKeywords] = useState(false);
    const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
        dayjs().subtract(3, "day"),
        dayjs(),
    ]);
    const [mode, setMode] = useState<"range" | "compare">(project?.mode?? "range");

    const loadProject = useCallback(() => {
        if (!id) return;

        setLoading(true);
        projectService
            .getById(id, dateRange, mode)
            .then(setProject)
            .catch(() => setError("Failed to load project"))
            .finally(() => setLoading(false));
    }, [id, dateRange]);

    useEffect(() => {
        loadProject();
    }, [loadProject]);

    // WebSocket subscription
    useEffect(() => {
        if (!id) return;

        // Subscribe to project-specific channel
        const channelName = `project-${id}`;
        const channel = pusher.subscribe(channelName);

        // Event handler for keyword updates
        const handleKeywordUpdate = (data: any) => {

            const updatedKeyword = data.keyword;

            // -----------------------------
            // NORMALIZE RESULTS
            // Backend sends:
            //     results: { rank_group, url, title }
            //
            // Frontend expects:
            //     results: [{ position, url, title, tracked_at, raw }]
            // -----------------------------

            const rawResults = updatedKeyword.results;

            let normalizedResults: any[] = [];

            if (Array.isArray(rawResults)) {
                normalizedResults = rawResults.map((r) => ({
                    position: r.rank_group ?? r.position ?? "-",
                    url: r.url ?? "",
                    title: r.title ?? "",
                    tracked_at: r.tracked_at ?? new Date().toISOString(),
                    raw: r,
                    created_at : r.created_at,
                }));
            } else if (rawResults) {
                normalizedResults = [
                    {
                        position: rawResults.rank_group ?? rawResults.position ?? "-",
                        url: rawResults.url ?? "",
                        title: rawResults.title ?? "",
                        tracked_at: rawResults.tracked_at ?? new Date().toISOString(),
                        raw: rawResults,
                        created_at: rawResults.created_at,
                    }
                ];
            }

            const first = normalizedResults[0] || {};

            const enrichedKeyword = {
                ...updatedKeyword,
                results: normalizedResults,
                title: first.title ?? "-",
                position: first.position ?? "-" // always normalized
            };

            // -----------------------------
            // MERGE INTO PROJECT STATE
            // -----------------------------

            setProject((prevProject) => {

                if (!prevProject) {
                    return prevProject;
                }

                const updatedKeywords = prevProject.keywords.map((k) => {
                    if (k.id === enrichedKeyword.id) {
                        return { ...k, ...enrichedKeyword };
                    }
                    return k;
                });

                return {
                    ...prevProject,
                    keywords: updatedKeywords,
                };
            });
        };

        // Bind to event
        channel.bind("keyword-updated", handleKeywordUpdate);

        // Cleanup on unmount
        return () => {
            channel.unbind("keyword-updated", handleKeywordUpdate);
            pusher.unsubscribe(channelName);
        };
    }, [id]);

    const handleAddKeyword = async (newKeywords: string[], groupId: number | null) => {
        if (!project || !id) return;

        try {
            setAddingKeywords(true);
            const response = await keywordService.create(id, newKeywords, groupId);

            const createdKeywords = response.keywords;

            setProject((prev) =>
                prev
                    ? { ...prev, keywords: [...prev.keywords, ...createdKeywords] }
                    : prev
            );

            toast.success("Keywords added successfully!");
        } catch (error: any) {
            console.error("Bulk keyword add failed", error);
            toast.error(error?.response?.data?.message || "Failed to add keywords");
        }
        setAddingKeywords(false);
        setDialogOpen(false);
    };

    return (
        <Box p={3}>
            <BackButton />
            <DataStateHandler<Project>
                loading={loading}
                error={error}
                data={project}
                emptyMessage="No project found"
            >

                {(projectData: Project) => (

                    <>
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                textAlign: "center",
                                mb: 6,
                            }}
                        >
                            <Typography
                                variant="h1"
                                sx={{
                                    fontSize: { xs: "2rem", md: "3rem" },
                                    fontWeight: 700,
                                    color: "primary.main",
                                    letterSpacing: 0.5,
                                    textTransform: "capitalize",
                                    borderBottom: "3px solid",
                                    borderColor: "primary.main",
                                    display: "inline-block",
                                    pb: 0.5,
                                    lineHeight: 1.2,
                                }}
                            >
                                {projectData.name}
                            </Typography>
                        </Box>

                        <Grid container spacing={3} alignItems="stretch">
                            <Grid size={{ xs: 12, md: 4, lg: 3.5 }}>
                                <ProjectDetails project={projectData} />
                                <KeywordGroups keywordGroups={projectData.keyword_groups}/>
                            </Grid>

                            <Grid size={{ xs: 12, md: 8, lg: 8.5 }}>
                                <Rechart
                                    keywords={projectData.keywords}
                                    datePeriod={dateRange}
                                    selectedMode={mode}
                                    setDateRangeFunction={(range) => {
                                        setDateRange(range);
                                    }}
                                    setDateModeFunction={(selectedMode)=>{
                                        setMode(selectedMode);
                                    }}
                                />
                            </Grid>
                        </Grid>


                        <Box position="relative">
                            <ProjectKeywordsSection
                                keywords={projectData.keywords}
                                keywordGroups={projectData.keyword_groups}
                                onAddKeyword={() => setDialogOpen(true)}
                                selectedDateRange={dateRange}
                                selectedMode={mode}
                            />

                            {addingKeywords && (
                                <Box
                                    sx={{
                                        position: "absolute",
                                        inset: 0,
                                        backgroundColor: "rgba(255,255,255,0.6)",
                                        backdropFilter: "blur(3px)",
                                        zIndex: 100,
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                    }}
                                >
                                    <CircularProgress size={50} />
                                </Box>
                            )}
                        </Box>

                        {isDialogOpen &&
                            <AddKeywordDialog
                                onClose={() => setDialogOpen(false)}
                                onSubmit={handleAddKeyword}
                            />
                        }
                    </>
                )}
            </DataStateHandler>
        </Box>
    );
}