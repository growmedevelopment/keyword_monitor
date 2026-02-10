import React, { useEffect, useState } from "react";
import { Dayjs } from "dayjs";
import { Box, Grid, CircularProgress } from "@mui/material";
import type { ComponentProps, SeoMetrics } from "./types";
import { filterResultsByRange, buildMetrics } from "./helpers";
import MetricCardItem from "./MetricCardItem";
import Chart from "./Chart";
import CalendarPicker from "./CalendarPicker";

const Rechart: React.FC<ComponentProps> = ({
                                               keywords,
                                               datePeriod: externalDateRange,
                                               selectedMode,
                                               setDateRangeFunction,
                                               setDateModeFunction
                                           }) => {

    const [pickerMode, setPickerMode] = useState<"range" | "compare" | "latest">(selectedMode);
    const [localRange, setLocalRange] = useState<[Dayjs | null, Dayjs | null]>(externalDateRange);
    const [metrics, setMetrics] = useState<SeoMetrics | null>(null);

    const recalc = (range: [Dayjs, Dayjs], mode: "range" | "compare" | "latest") => {
        const filtered = filterResultsByRange(keywords, range, mode);
        setMetrics(buildMetrics(filtered));
    };

    useEffect(() => {
        setLocalRange(externalDateRange);
        setPickerMode(selectedMode);
        recalc(externalDateRange, selectedMode);
    }, [keywords, externalDateRange, selectedMode]);

    if (!metrics) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", height: 300 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3, bgcolor: "background.paper", borderRadius: 1, mb: 3 }}>

                <CalendarPicker
                    initialRange={localRange}
                    mode={pickerMode}
                    onApply={(range, mode) => {
                        // Update internal UI
                        setLocalRange(range);
                        setPickerMode(mode);

                        // Update parent (triggers backend request)
                        setDateRangeFunction?.(range);
                        setDateModeFunction?.(mode);

                        // Recalculate metrics
                        recalc(range, mode);
                    }}
                />


            {/* Metrics */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid size={{xs: 12, sm:6, md:4}}>
                    <MetricCardItem
                        title="Average Position"
                        value={metrics.average_position}
                    />
                </Grid>
                <Grid size={{xs: 12, sm:6, md:4}}>
                    <MetricCardItem
                        title="Tracked Keywords"
                        value={metrics.tracked_keywords}
                    />
                </Grid>
            </Grid>

            <Box sx={{ height: 300 }}>
                <Chart metrics={metrics} />
            </Box>
        </Box>
    );
};

export default Rechart;