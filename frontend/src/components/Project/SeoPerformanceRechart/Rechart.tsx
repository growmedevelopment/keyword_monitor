import React, { useEffect, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import { Box, Grid, Button, CircularProgress } from "@mui/material";

import type { ComponentProps, SeoMetrics } from "./types";
import { filterResultsByRange, buildMetrics } from "./helpers";
import MetricCardItem from "./MetricCardItem";
import Chart from "./Chart";
import CalendarPicker from "./CalendarPicker";

const Rechart: React.FC<ComponentProps> = ({keywords, datePeriod: externalDateRange, setDateRangeFunction,}) => {
    const [pickerMode, setPickerMode] = useState<"range" | "compare">("range");

    const [localRange, setLocalRange] = useState<[Dayjs | null, Dayjs | null]>(
        externalDateRange
    );

    const [metrics, setMetrics] = useState<SeoMetrics | null>(null);

    const recalc = (range: [Dayjs, Dayjs]) => {
        const filtered = filterResultsByRange(keywords, range);
        setMetrics(buildMetrics(filtered));
    };

    // Sync updates coming from parent (ProjectShowPage)
    useEffect(() => {
        setLocalRange(externalDateRange);
        recalc(externalDateRange);
    }, [keywords, externalDateRange]);

    if (!metrics) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", height: 300 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3, bgcolor: "background.paper", borderRadius: 1, mb: 3 }}>
            {/* Date Selector Box */}
            <Box
                sx={{
                    p: 2,
                    borderRadius: 2,
                    border: "1px solid #e0e0e0",
                    mb: 3,
                    backgroundColor: "#fafafa",
                }}
            >
                {/* Presets */}
                <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
                    {[
                        { label: "CURRENT", value: externalDateRange },
                        { label: "7D", value: [dayjs().subtract(7, "day"), dayjs()] },
                        { label: "1M", value: [dayjs().subtract(1, "month"), dayjs()] },
                        { label: "3M", value: [dayjs().subtract(3, "month"), dayjs()] },
                        { label: "6M", value: [dayjs().subtract(6, "month"), dayjs()] },
                        { label: "1Y", value: [dayjs().subtract(12, "month"), dayjs()] },
                    ].map((preset) => {
                        const isActive =
                            localRange[0]?.isSame(preset.value[0], "day") &&
                            localRange[1]?.isSame(preset.value[1], "day");

                        return (
                            <Button
                                key={preset.label}
                                variant={isActive ? "contained" : "outlined"}
                                size="small"
                                onClick={() => {
                                    setPickerMode("range");

                                    const range = preset.value as [Dayjs, Dayjs];
                                    setLocalRange(range);

                                    setDateRangeFunction?.(range, "range");
                                    recalc(range);
                                }}
                            >
                                {preset.label}
                            </Button>
                        );
                    })}
                </Box>

                <CalendarPicker
                    initialRange={localRange}
                    mode={pickerMode}
                    onApply={(range, mode) => {
                        setPickerMode(mode);
                        setLocalRange(range);
                        setDateRangeFunction?.(range, mode);
                        recalc(range);
                    }}
                />
            </Box>

            {/* Metrics */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <MetricCardItem
                        title="Average Position"
                        value={metrics.average_position}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <MetricCardItem
                        title="Tracked Keywords"
                        value={metrics.tracked_keywords}
                    />
                </Grid>
            </Grid>

            {/* Chart */}
            <Box sx={{ height: 300 }}>
                <Chart metrics={metrics} />
            </Box>
        </Box>
    );
};

export default Rechart;