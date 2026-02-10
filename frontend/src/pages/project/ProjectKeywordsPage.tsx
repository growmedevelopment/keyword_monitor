import {useCallback, useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import {Box, CircularProgress, Typography, Breadcrumbs, Link as MUILink} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import pusher from "../../pusher.ts";
import projectService from "../../services/projectService.ts";
import keywordService from "../../services/keywordService.ts";
import AddKeywordDialog from "../../components/Dialogs/AddKeywordDialog/AddKeywordDialog.tsx";
import type {Project} from "../../components/types/projectTypes.ts";
import ProjectKeywordsSection from "../../components/Project/ProjectKeywordsSection.tsx";
import KeywordGroups from "../../components/Project/KeywordGroups.tsx";
import DataStateHandler from "../../components/Common/DataStateHandler.tsx";
import toast from "react-hot-toast";
import Rechart from "../../components/Project/SeoPerformanceRechart/Rechart.tsx";
import dayjs, {type Dayjs} from "dayjs";
import BackButton from "../../components/Common/BackButton.tsx";

export default function ProjectKeywordsPage() {
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
    const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);

    const loadProject = useCallback(() => {
        if (!id) return;

        setLoading(true);
        projectService
            .getDetailedById(id, dateRange, mode)
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

    const handleAddKeyword = async (newKeywords: string[], groupId: number[] | null) => {
        if (!project || !id) return;

        try {
            setAddingKeywords(true);

            // 1. Call the service
            const response = await keywordService.create(id, newKeywords, groupId);

            // 2. Destructure the "Smart Response" data
            const {
                added_count,
                skipped_count,
                added_keywords,
                skipped_keywords,
            } = response.data;

            // 3. Update State (Add only the NEW ones)
            if (added_count > 0) {
                setProject((prev) =>
                    prev
                        ? { ...prev, keywords: [...prev.keywords, ...added_keywords] }
                        : prev
                );
            }

            // 4. Smart User Feedback
            if (added_count > 0 && skipped_count === 0) {
                toast.success(`Successfully added ${added_count} keywords!`);

            } else if (added_count > 0 && skipped_count > 0) {
                toast.success(`Added ${added_count} keywords. Skipped ${skipped_count} duplicates. ${skipped_keywords.join(',')}`);

            } else if (added_count === 0 && skipped_count > 0) {
                toast.error(`All ${skipped_count} keywords were duplicates and skipped.`);
            }

        } catch (error: any) {
            console.error("Bulk keyword add failed", error);
            toast.error(error?.response?.data?.message || "Failed to add keywords");
        } finally {
            setAddingKeywords(false);
            setDialogOpen(false);
        }
    };

    return (
        <Box p={3}>
            <Box sx={{ mb: 3 }}>
                <Breadcrumbs aria-label="breadcrumb">
                    <MUILink component={RouterLink} to="/projects" underline="hover" color="inherit">
                        Projects
                    </MUILink>

                    <MUILink
                        component={RouterLink}
                        to={`/projects/${id}`}
                        underline="hover"
                        color="inherit"
                    >
                        {project?.name}
                    </MUILink>

                    <Typography color="text.primary">Keywords</Typography>
                </Breadcrumbs>
            </Box>

            <BackButton fallbackPath={`/projects/${project?.id}`} />

            <DataStateHandler<Project>
                loading={loading}
                error={error}
                data={project}
                emptyMessage="No project found"
            >

                {(projectData: Project) => (

                    <>

                        <Box sx={{ mb: 4 }}>
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
                        </Box>

                        <Box sx={{ mb: 4 }}>
                            <KeywordGroups
                                keywordGroups={projectData.keyword_groups}
                                selectedGroupId={selectedGroupId}
                                onSelectGroup={setSelectedGroupId}
                                onGroupsChange={(updatedGroups) => {
                                    setProject(prev => prev ? { ...prev, keyword_groups: updatedGroups } : prev);
                                }}
                            />
                        </Box>

                        <Box position="relative">
                            <ProjectKeywordsSection
                                keywords={selectedGroupId
                                    ? projectData.keywords.filter(k =>
                                        Array.isArray(k.keyword_groups)
                                            ? k.keyword_groups.some(g => g.id === selectedGroupId)
                                            : (k.keyword_groups as any)?.id === selectedGroupId
                                    )
                                    : projectData.keywords
                                }
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
                                keywordGroups={projectData.keyword_groups}
                            />
                        }
                    </>
                )}
            </DataStateHandler>
        </Box>
    );
}
