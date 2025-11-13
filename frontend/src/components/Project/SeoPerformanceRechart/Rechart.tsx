import React, { useEffect, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import { Box, Grid, Button, CircularProgress } from "@mui/material";
import { DateRangePicker } from "@mui/x-date-pickers-pro/DateRangePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

import type {ComponentProps, SeoMetrics} from "./types";
import { filterResultsByRange, buildMetrics } from "./helpers";
import MetricCardItem from "./MetricCardItem";
import Chart from "./Chart";

const Rechart: React.FC<ComponentProps> = ({
                                               keywords,
                                               datePeriod: externalDateRange,
                                               setDateRangeFunction,
                                           }) => {
    const [localRange, setLocalRange] = useState<[Dayjs | null, Dayjs | null]>(
        externalDateRange
    );

    const [metrics, setMetrics] = useState<SeoMetrics | null>(null);

    const recalc = (range: [Dayjs, Dayjs]) => {
        const filtered = filterResultsByRange(keywords, range);
        setMetrics(buildMetrics(filtered));
    };

    useEffect(() => {
        recalc(externalDateRange);
    }, [keywords, externalDateRange]);

    const handleApply = () => {
        if (!localRange[0] || !localRange[1]) return;
        const range = localRange as [Dayjs, Dayjs];
        setDateRangeFunction?.(range);
        recalc(range);
    };

    if (!metrics) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", height: 300 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box sx={{ p: 3, bgcolor: "background.paper", borderRadius: 1, mb: 3 }}>
                <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
                    <DateRangePicker
                        value={localRange}
                        onChange={(newVal) => setLocalRange(newVal)}
                        format="DD/MM/YYYY"
                        shouldDisableDate={(date) => date.isAfter(dayjs(), "day")}
                    />
                    <Button variant="contained" onClick={handleApply}>
                        Apply
                    </Button>
                </Box>

                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid size={{xs:12, sm:6, md:4}}  >
                        <MetricCardItem title="Average Position" value={metrics.average_position} />
                    </Grid>
                    <Grid size={{xs:12, sm:6, md:4}}>
                        <MetricCardItem title="Tracked Keywords" value={metrics.tracked_keywords} />
                    </Grid>
                </Grid>

                <Box sx={{ height: 300 }}>
                    <Chart metrics={metrics} />
                </Box>
            </Box>
        </LocalizationProvider>
    );
};

export default Rechart;