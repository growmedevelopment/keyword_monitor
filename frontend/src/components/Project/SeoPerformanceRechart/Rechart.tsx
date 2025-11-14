import React, { useEffect, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import { Box, Grid, Button, CircularProgress } from "@mui/material";
import type { DateRange } from "react-day-picker";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

import type { ComponentProps, SeoMetrics } from "./types";
import { filterResultsByRange, buildMetrics } from "./helpers";
import MetricCardItem from "./MetricCardItem";
import Chart from "./Chart";

const Rechart: React.FC<ComponentProps> = ({keywords, datePeriod: externalDateRange, setDateRangeFunction}) => {
    const [pickerMode, setPickerMode] = useState<"range" | "compare">("range");

    const [localRange, setLocalRange] = useState<[Dayjs | null, Dayjs | null]>(
        externalDateRange
    );

    const [range, setRange] = useState<DateRange>({
        from: externalDateRange[0].toDate(),
        to: externalDateRange[1].toDate(),
    });

    const [compareDates, setCompareDates] = useState<Date[]>([]);

    const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

    const [metrics, setMetrics] = useState<SeoMetrics | null>(null);

    const recalc = (range: [Dayjs, Dayjs]) => {
        const filtered = filterResultsByRange(keywords, range);
        setMetrics(buildMetrics(filtered));
    };

    useEffect(() => {
        recalc(externalDateRange);

        setRange({
            from: externalDateRange[0].toDate(),
            to: externalDateRange[1].toDate(),
        });

        setLocalRange(externalDateRange);
        setCurrentMonth(externalDateRange[0].toDate());
    }, [keywords, externalDateRange]);

    const handleApply = () => {
        if (!localRange[0] || !localRange[1]) return;
        const range = localRange as [Dayjs, Dayjs];
        setDateRangeFunction?.(range, pickerMode);
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
        <Box sx={{ p: 3, bgcolor: "background.paper", borderRadius: 1, mb: 3 }}>

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
                                    setRange({
                                        from: range[0].toDate(),
                                        to: range[1].toDate(),
                                    });
                                    setCurrentMonth(range[0].toDate());

                                    setDateRangeFunction?.(range, "range");
                                    recalc(range);
                                }}
                                sx={{
                                    minWidth: 60,
                                    fontSize: "0.75rem",
                                    fontWeight: 600,
                                    borderRadius: 1,
                                }}
                            >
                                {preset.label}
                            </Button>
                        );
                    })}

                    <Button variant="outlined" size="small" disabled sx={{ opacity: 0.5 }}>
                        CUSTOM
                    </Button>
                </Box>

                {/* Mode Switcher */}
                <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                    <Button
                        variant={pickerMode === "range" ? "contained" : "outlined"}
                        size="small"
                        onClick={() => setPickerMode("range")}
                    >
                        Range
                    </Button>

                    <Button
                        variant={pickerMode === "compare" ? "contained" : "outlined"}
                        size="small"
                        onClick={() => setPickerMode("compare")}
                    >
                        Compare (2 dates)
                    </Button>
                </Box>

                {/* Calendar */}
                <Box>
                    {pickerMode === "range" && (
                        <DayPicker
                            mode="range"
                            selected={range}
                            onSelect={(r) => {
                                if (!r?.from || !r?.to) return;
                                setRange(r);
                                setCurrentMonth(r.from);

                                const newRange: [Dayjs, Dayjs] = [
                                    dayjs(r.from),
                                    dayjs(r.to),
                                ];
                                setLocalRange(newRange);
                            }}
                            numberOfMonths={2}
                            month={currentMonth}
                            onMonthChange={setCurrentMonth}
                        />
                    )}

                    {pickerMode === "compare" && (
                        <DayPicker
                            mode="multiple"
                            max={2}
                            selected={compareDates}
                            onSelect={(dates: Date[] | undefined) => {
                                const selected = dates ?? [];

                                setCompareDates(selected);

                                if (selected.length > 0) {
                                    setCurrentMonth(selected[0]);
                                }

                                if (selected.length === 2) {
                                    const newRange: [Dayjs, Dayjs] = [
                                        dayjs(selected[0]),
                                        dayjs(selected[1]),
                                    ];
                                    setLocalRange(newRange);
                                }
                            }}
                            numberOfMonths={2}
                            month={currentMonth}
                            onMonthChange={setCurrentMonth}
                        />
                    )}
                </Box>

                {/* Apply */}
                <Box sx={{ mt: 2 }}>
                    <Button variant="contained" onClick={handleApply}>
                        Apply
                    </Button>
                </Box>
            </Box>

            {/* Metrics */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid size={{xs: 12, sm: 6, md:4 }}>
                    <MetricCardItem
                        title="Average Position"
                        value={metrics.average_position}
                    />
                </Grid>
                <Grid size={{xs: 12, sm: 6, md:4 }} >
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