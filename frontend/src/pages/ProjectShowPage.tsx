import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import {
    Box,
    Typography,
    Skeleton,
} from "@mui/material";

import projectService from "../services/projectService";
import keywordService from "../services/keywordService.ts";
import AddKeywordDialog from "../components/Dialogs/AddKeywordDialog/AddKeywordDialog.tsx";
import type { Project } from "../components/types/projectTypes";
import ProjectDetails from "../components/Project/ProjectDetails.tsx";
import ProjectKeywordsSection from "../components/Project/ProjectKeywordsSection.tsx";

export default function ProjectShowPage() {
    const { id } = useParams<{ id: string }>();
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isDialogOpen, setDialogOpen] = useState(false);

    /**
     * Load project details
     */
    const loadProject = useCallback(() => {
        if (!id) return;

        setLoading(true);
        projectService
            .getById(id)
            .then(setProject)
            .catch(() => setError("Failed to load project"))
            .finally(() => setLoading(false));
    }, [id]);

    /**
     * Initial load + polling for incomplete keywords
     */
    useEffect(() => {
        loadProject();

        const interval = setInterval(() => {
            setProject((prev) => {
                if (!prev || prev.keywords.every((k) => k.status === "Completed")) {
                    return prev; // Stop polling if all completed
                }
                loadProject();
                return prev;
            });
        }, 10000);

        return () => clearInterval(interval);
    }, [loadProject]);

    /**
     * Handle adding new keyword
     */
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

    /** ---------------- RENDER ---------------- */

    if (loading) {
        return (
            <Box p={3}>
                <Skeleton variant="text" width={200} height={40} />
                <Skeleton variant="rectangular" height={120} sx={{ mt: 2 }} />
            </Box>
        );
    }

    if (error) return <Typography color="error">{error}</Typography>;
    if (!project) return <Typography>No project found</Typography>;

    return (
        <Box p={3}>
            {/* Project Title */}
            <Typography variant="h4" gutterBottom>
                {project.name}
            </Typography>

            {/* Project Details */}
            <ProjectDetails project={project} />

            {/* Keywords Section */}
            <ProjectKeywordsSection
                keywords={project.keywords}
                onAddKeyword={() => setDialogOpen(true)}
            />

            {/* Add Keyword Dialog */}
            <AddKeywordDialog
                isOpen={isDialogOpen}
                onClose={() => setDialogOpen(false)}
                onSubmit={handleAddKeyword}
            />
        </Box>
    );
}