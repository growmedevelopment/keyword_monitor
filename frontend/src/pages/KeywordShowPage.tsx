import { Box, Typography, Paper } from "@mui/material";
import type { Keyword, KeywordGroup } from "../components/types/keywordTypes.ts";
import {useCallback, useEffect, useState} from "react";
import { useParams } from "react-router-dom";
import keywordService from "../services/keywordService.ts";
import keywordGroupService from "../services/keywordGroupService.ts";
import KeywordRankGrid from "../components/Tables/KeywordRankTable/KeywordRankGrid.tsx";
import DataStateHandler from "../components/Common/DataStateHandler.tsx";
import KeywordTagSelector from "../components/Common/KeywordTagSelector.tsx";
import toast from "react-hot-toast";
import BackButton from "../components/Common/BackButton.tsx";
import dayjs, {type Dayjs} from "dayjs";
import Rechart from "../components/Project/SeoPerformanceRechart/Rechart.tsx";

export default function KeywordShowPage() {
    const { id } = useParams<{ id: string }>();
    const [keyword, setKeyword] = useState<Keyword | null>(null);
    const [keywordGroups, setKeywordGroups] = useState<KeywordGroup[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedKeywordGroup, setSelectedKeywordGroup] = useState<number | null>(null);
    const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
        dayjs().subtract(3, "day"),
        dayjs(),
    ]);

    const [mode, setMode] = useState<"range" | "compare">("range");

    const loadKeyword = useCallback(() => {
        if (!id) return;

        setLoading(true);

        keywordService
            .getByFilteredResults(id, dateRange, mode)
            .then(async (keywordData) => {
                setKeyword(keywordData);

                if (keywordData.keyword_groups) {
                    setSelectedKeywordGroup(keywordData.keyword_groups.id);
                }

                // Load groups only once OR always if needed
                const groups = await keywordGroupService.getByProject(keywordData.project_id);
                setKeywordGroups(groups);
            })
            .catch(() => setError("Failed to load data"))
            .finally(() => setLoading(false));
    }, [id, dateRange]);

    useEffect(() => {
        loadKeyword();
    }, [loadKeyword]);

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

                    <BackButton />

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
                            {keywordData.keyword}
                        </Typography>
                    </Box>


                    <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        gap={2}
                        mb={2}
                        sx={{
                            backgroundColor: '#fff',
                            borderRadius: 2,
                            px: 2,
                            py: 1.5,
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                            width: 'fit-content',
                        }}
                    >
                        <Typography variant="h6" gutterBottom>
                            Keyword groups (tags) :
                        </Typography>

                        <KeywordTagSelector
                            groups={keywordGroups}
                            selectedGroupId={selectedKeywordGroup}
                            onChange={(groupId) => {
                                setSelectedKeywordGroup(groupId);
                                assignKeywordToGroup(Number(id), groupId).then();
                            }}
                        />
                    </Box>

                    <Paper sx={{ mt: 3, p: 2 }}>
                        <Rechart
                            keywords={[keywordData]}
                            datePeriod={dateRange}
                            selectedMode={mode}
                            setDateRangeFunction={(range) => {
                                setDateRange(range);
                            }}
                            setDateModeFunction={(selectedMode) => {
                                setMode(selectedMode);
                            }}
                        />
                    </Paper>

                    <Paper sx={{ mt: 3 }}>
                        <KeywordRankGrid data={keywordData.keywords_rank ?? []} />
                    </Paper>
                </Box>
            )}
        </DataStateHandler>
    );
}