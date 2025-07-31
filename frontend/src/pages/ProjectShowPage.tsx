import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import {Box, Table, TableBody, TableCell, TableHead, TableRow, Typography} from "@mui/material";
import pusher from "../pusher";
import projectService from "../services/projectService";
import keywordService from "../services/keywordService.ts";
import AddKeywordDialog from "../components/Dialogs/AddKeywordDialog/AddKeywordDialog.tsx";
import type { Project } from "../components/types/projectTypes";
import ProjectDetails from "../components/Project/ProjectDetails.tsx";
import ProjectKeywordsSection from "../components/Project/ProjectKeywordsSection.tsx";
import DataStateHandler from "../components/Common/DataStateHandler.tsx";


export default function ProjectShowPage() {
    const { id } = useParams<{ id: string }>();
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
            console.log("Keyword updated:", data);

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
                    k.id === enrichedKeyword.id ? { ...k, ...enrichedKeyword } : k
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

    const handleAddKeyword = (newKeywords: string[]) => {
        if (!project || !id) return;

        newKeywords.forEach((keyword) => {
            keywordService
                .create(id, keyword)
                .then((response) => {
                    const createdKeyword = {
                        ...response.keyword,
                        status: response.keyword.status ?? "Queued",
                        data_for_seo_results: response.keyword.data_for_seo_results ?? [],
                    };

                    setProject((prev) =>
                        prev ? { ...prev, keywords: [...prev.keywords, createdKeyword] } : prev
                    );
                })
                .catch(() => console.error("Failed to create keyword"));
        });

        setDialogOpen(false);
    };

    return (
        // <Box p={3}>
        //     <DataStateHandler<Project>
        //         loading={loading}
        //         error={error}
        //         data={project}
        //         emptyMessage="No project found"
        //     >
        //         {(projectData: Project) => (
        //             <>
        //                 {/* Project Title */}
        //                 <Typography variant="h4" gutterBottom>
        //                     {projectData.name}
        //                 </Typography>
        //
        //                 {/* Project Details */}
        //                 <ProjectDetails project={projectData} />
        //
        //                 {/* Keywords Section */}
        //                 <ProjectKeywordsSection
        //                     keywords={projectData.keywords}
        //                     onAddKeyword={() => setDialogOpen(true)}
        //                 />
        //
        //                 {/* Add Keyword Dialog */}
        //                 <AddKeywordDialog
        //                     isOpen={isDialogOpen}
        //                     onClose={() => setDialogOpen(false)}
        //                     onSubmit={handleAddKeyword}
        //                 />
        //             </>
        //         )}
        //     </DataStateHandler>
        // </Box>

        <Box p={3}>
            {/* Loading and error handling */}
            {loading && <Typography>Loading...</Typography>}
            {error && <Typography color="error">{error}</Typography>}
            {!loading && !error && project && (
                <>
                    {/* Project Title */}
                    <Typography variant="h4" gutterBottom>
                        {project.name}
                    </Typography>

                    {/* Project Details */}
                    <ProjectDetails project={project} />

                    {/* Keywords Table */}
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Keyword</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Position</TableCell>
                                <TableCell>Title</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {project.keywords.map((k) => (
                                <TableRow key={k.id}>
                                    <TableCell>{k.keyword}</TableCell>
                                    <TableCell>{k.status}</TableCell>
                                    {/*<TableCell>{k.results.rank_group ?? "-"}</TableCell>*/}
                                    {/*<TableCell>{k.results[0].title ?? "-"}</TableCell>*/}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    {/* Add Keyword Dialog */}
                    <AddKeywordDialog
                        isOpen={isDialogOpen}
                        onClose={() => setDialogOpen(false)}
                        onSubmit={handleAddKeyword}
                    />
                </>
            )}
        </Box>
    );
}