import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Box, Typography } from "@mui/material";

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

        const interval = setInterval(() => {
            setProject((prev) => {
                if (!prev || prev.keywords.every((k) => k.status === "Completed")) {
                    return prev;
                }
                loadProject();
                return prev;
            });
        }, 10000);

        return () => clearInterval(interval);
    }, [loadProject]);

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
                        <ProjectDetails project={projectData} />

                        {/* Keywords Section */}
                        <ProjectKeywordsSection
                            keywords={projectData.keywords}
                            onAddKeyword={() => setDialogOpen(true)}
                        />

                        {/* Add Keyword Dialog */}
                        <AddKeywordDialog
                            isOpen={isDialogOpen}
                            onClose={() => setDialogOpen(false)}
                            onSubmit={handleAddKeyword}
                        />
                    </>
                )}
            </DataStateHandler>
        </Box>
    );
}