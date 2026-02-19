import { Box, Typography, Paper, CircularProgress, Fade } from "@mui/material";
import type { Keyword, KeywordGroup } from "../components/types/keywordTypes.ts";
import { useCallback, useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import keywordService from "../services/keywordService.ts";
import keywordGroupService from "../services/keywordGroupService.ts";
import KeywordRankGrid from "../components/Tables/KeywordRankTable/KeywordRankGrid.tsx";
import DataStateHandler from "../components/Common/DataStateHandler.tsx";
import KeywordTagSelector from "../components/Common/KeywordTagSelector.tsx";
import toast from "react-hot-toast";
import BackButton from "../components/Common/BackButton.tsx";
import dayjs, { type Dayjs } from "dayjs";
import Rechart from "../components/Project/SeoPerformanceRechart/Rechart.tsx";

export default function KeywordShowPage() {
    const { id } = useParams<{ id: string }>();
    const [keyword, setKeyword] = useState<Keyword | null>(null);
    const [keywordGroups, setKeywordGroups] = useState<KeywordGroup[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [selectedKeywordGroups, setSelectedKeywordGroups] = useState<number[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    const originalGroupsRef = useRef<string>("");

    const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
        dayjs().subtract(3, "day"),
        dayjs(),
    ]);
    const [mode, setMode] = useState<"range" | "compare" | "latest">("latest");

    /**
     * 1. STATIC DATA LOADER (Runs only when ID changes)
     * Fetches Project Groups and Assigned IDs. Does NOT depend on filters.
     */
    useEffect(() => {
        if (!id) return;

        const fetchStaticData = async () => {
            try {
                // First get the keyword basic info to obtain project_id
                const baseInfo = await keywordService.getByFilteredResults(id, dateRange, mode);

                const [allGroups, assignedIds] = await Promise.all([
                    keywordGroupService.getByProject(baseInfo.project_id),
                    keywordService.getAssignedGroups(id)
                ]);

                setKeywordGroups(allGroups);

                // Set the baseline snapshot immediately
                const sortedIds = [...assignedIds].sort((a, b) => a - b);
                originalGroupsRef.current = JSON.stringify(sortedIds);

                // Set UI state (checks the boxes)
                setSelectedKeywordGroups(assignedIds);
            } catch (err) {
                console.error("Static data load failed", err);
            }
        };

        fetchStaticData();
    }, [id]); // Only runs when the Keyword ID changes

    /**
     * 2. DYNAMIC SEO LOADER (Runs on mount AND when filters change)
     * Only fetches the performance data.
     */
    const loadKeywordPerformance = useCallback(async () => {
        if (!id) return;
        setLoading(true);

        try {
            const keywordData = await keywordService.getByFilteredResults(id, dateRange, mode);
            setKeyword(keywordData);
        } catch (err) {
            setError("Failed to load SEO performance data");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [id, dateRange, mode]);

    useEffect(() => {
        loadKeywordPerformance();
    }, [loadKeywordPerformance]);

    /**
     * 3. DEBOUNCE WATCHER
     */
    useEffect(() => {
        if (!id || originalGroupsRef.current === "") return;

        const currentDataString = JSON.stringify([...selectedKeywordGroups].sort((a, b) => a - b));

        // EXIT if selection matches the database baseline
        if (currentDataString === originalGroupsRef.current) {
            setIsSaving(false);
            return;
        }

        setIsSaving(true);
        const handler = setTimeout(() => {
            assignKeywordToGroups(Number(id), selectedKeywordGroups);
        }, 2000);

        return () => clearTimeout(handler);
    }, [selectedKeywordGroups, id]);

    const handleTagChange = (groupsId: number[]) => {
        setSelectedKeywordGroups(groupsId);
    };

    async function assignKeywordToGroups(keywordId: number, groupsId: number[]) {
        try {
            const response = await keywordGroupService.setProjectKeywordGroup(keywordId, groupsId);
            if (response.status === "success") {
                toast.success("Groups updated");
                originalGroupsRef.current = JSON.stringify([...groupsId].sort((a, b) => a - b));
            }
        } catch (error) {
            toast.error("Failed to update keyword groups");
        } finally {
            setIsSaving(false);
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
                    <BackButton />

                    <Box sx={{ display: "flex", justifyContent: "center", mb: 6 }}>
                        <Typography variant="h1" sx={{ fontWeight: 700, color: "primary.main", textTransform: "capitalize", borderBottom: "3px solid", borderColor: "primary.main", pb: 0.5 }}>
                            {keywordData.keyword}
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, backgroundColor: '#fff', borderRadius: 2, px: 2, py: 1.5, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', width: 'fit-content' }}>
                        <Typography variant="h6">Keyword groups (tags):</Typography>

                        <KeywordTagSelector
                            groups={keywordGroups}
                            selectedGroupIds={selectedKeywordGroups}
                            onChange={handleTagChange}
                            collapsed={false}
                        />

                        <Fade in={isSaving}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2 }}>
                                <CircularProgress size={16} />
                                <Typography variant="caption" color="textSecondary">Saving...</Typography>
                            </Box>
                        </Fade>
                    </Box>

                    <Paper sx={{ mt: 3, p: 2 }}>
                        <Rechart
                            keywords={[keywordData]}
                            datePeriod={dateRange}
                            selectedMode={mode}
                            setDateRangeFunction={setDateRange}
                            setDateModeFunction={setMode}
                        />
                    </Paper>

                    <Paper sx={{ mt: 3 }}>
                        <KeywordRankGrid
                            data={keywordData.keywords_rank ?? []}
                            searchValue={keywordData.search_value?.search_volume ?? null}
                        />
                    </Paper>
                </Box>
            )}
        </DataStateHandler>
    );
}