import { Box, Typography, Paper } from "@mui/material";
import type { Keyword, KeywordGroup } from "../components/types/keywordTypes.ts";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import keywordService from "../services/keywordService.ts";
import keywordGroupService from "../services/keywordGroupService.ts";
import KeywordRankGrid from "../components/Tables/KeywordRankTable/KeywordRankGrid.tsx";
import DataStateHandler from "../components/Common/DataStateHandler.tsx";
import KeywordTagSelector from "../components/Common/KeywordTagSelector.tsx";
import toast from "react-hot-toast";

export default function KeywordShowPage() {
    const { id } = useParams<{ id: string }>();
    const [keyword, setKeyword] = useState<Keyword | null>(null);
    const [keywordGroups, setKeywordGroups] = useState<KeywordGroup[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedKeywordGroup, setSelectedKeywordGroup] = useState<number | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            try {
                setLoading(true);
                const keywordData = await keywordService.getById(id);
                setKeyword(keywordData);

                if (keywordData.keyword_groups) {
                    setSelectedKeywordGroup(keywordData.keyword_groups.id);
                }

                const groups = await keywordGroupService.getByProject(keywordData.project_id);
                setKeywordGroups(groups);
            } catch {
                setError("Failed to load data");
            } finally {
                setLoading(false);
            }
        };

        fetchData().then();
    }, [id]);

    async function assignKeywordToGroup(keywordId: number, groupId: number | null) {
        try {
            if (!groupId) {
                const response = await keywordGroupService.unsetProjectKeywordGroup(keywordId);
                if (response.status === "success") {
                    toast.success(response.message);
                    setSelectedKeywordGroup(null);
                }
                return;
            }
            const response = await keywordGroupService.setProjectKeywordGroup(keywordId, groupId);
            if (response.status === "success") {
                toast.success(response.message);
            }
        } catch (error) {
            toast.error("Failed to assign keyword group");
            console.error(error);
        }
    }

    return (
        <DataStateHandler<Keyword>
            loading={loading}
            error={error}
            data={keyword}
            emptyMessage="No keyword found"
        >
            {(keywordData) => (
                <Box p={3}>
                    {/* Keyword Title */}
                    <Typography variant="h4" gutterBottom>
                        {keywordData.keyword}
                    </Typography>

                    {/* Keyword Tag Selector */}
                    <KeywordTagSelector
                        groups={keywordGroups}
                        selectedGroupId={selectedKeywordGroup}
                        onChange={(groupId) => {
                            setSelectedKeywordGroup(groupId);
                            assignKeywordToGroup(Number(id), groupId).then();
                        }}
                    />

                    {/* Keyword Ranks */}
                    <Paper sx={{ mt: 3 }}>
                        <KeywordRankGrid data={keywordData.keywords_rank ?? []} />
                    </Paper>
                </Box>
            )}
        </DataStateHandler>
    );
}