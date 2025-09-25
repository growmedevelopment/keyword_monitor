import {useEffect, useState, useCallback} from "react";
import {useParams} from "react-router-dom";
import {Box, Typography} from "@mui/material";
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


export default function ProjectShowPage() {
    const {id} = useParams<{ id: string }>();
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isDialogOpen, setDialogOpen] = useState(false);

    const loadProject = useCallback(() => {
        if (!id) return;

        setLoading(true);
        projectService
            .getById(id)
            .then(setProject)
            .catch(() => setError("Failed to load project"))
            .finally(() => setLoading(false));
    }, [id]);

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

            // Extract title and position from first result if available
            const firstResult = updatedKeyword.data_for_seo_results?.[0] || {};
            const enrichedKeyword = {
                ...updatedKeyword,
                title: firstResult.title || "-",
                position: firstResult.rank_group || "-",
            };

            setProject((prevProject) => {
                if (!prevProject) return prevProject;

                const updatedKeywords = prevProject.keywords.map((k) =>
                    k.id === enrichedKeyword.id ? {...k, ...enrichedKeyword} : k
                );

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

    const handleAddKeyword = (newKeywords: string[], groupId: number | null) => {
        if (!project || !id) return;

        newKeywords.forEach((keyword) => {
            keywordService
                .create(id, keyword, groupId)
                .then((response) => {
                    const createdKeyword = {...response.keyword,};

                    setProject((prev) =>
                        prev ? {...prev, keywords: [...prev.keywords, createdKeyword]} : prev
                    );

                    toast.success(response.message);
                })
                .catch((error) => {
                    console.error("Failed to create keyword", error);
                    toast.error(
                        error?.response?.data?.message || error.message || "Failed to create keyword."
                    );
                });
        });

        setDialogOpen(false);
    };

    return (
        <Box p={3}>
            <DataStateHandler<Project>
                loading={loading}
                error={error}
                data={project}
                emptyMessage="No project found"
            >


                {(projectData: Project) => (

                    <>
                        {/* Project Title */}
                        <Typography variant="h4" gutterBottom>
                            {projectData.name}
                        </Typography>

                        {/* Project Details */}
                        <ProjectDetails project={projectData}/>

                        <KeywordGroups keywordGroups={projectData.keyword_groups}/>

                        {/*/!* Keywords Section *!/*/}
                        <ProjectKeywordsSection
                            keywords={projectData.keywords}
                            onAddKeyword={() => setDialogOpen(true)}
                        />



                        {/* Add Keyword Dialog */}
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