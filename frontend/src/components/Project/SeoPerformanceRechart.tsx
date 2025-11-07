import React, { useEffect, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import {Box, Card, CardContent, Typography, Grid, ToggleButton, ToggleButtonGroup, CircularProgress, Button,} from "@mui/material";
import {LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,} from "recharts";
import { DateRangePicker } from "@mui/x-date-pickers-pro/DateRangePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import keywordService, {type SeoMetricsResponse} from "../../services/keywordService.ts";

// Types
type ComponentProps = {
    projectId: number;
};


// Metric Card
const MetricCardItem = ({ title, value }: { title: string; value: number | string }) => (
    <Card sx={{ textAlign: "center", p: 1, borderRadius: 3 }}>
        <CardContent>
            <Typography variant="subtitle2" color="text.secondary">
                {title.toUpperCase()}
            </Typography>
            <Typography variant="h5" fontWeight={700}>
                {value}
            </Typography>
        </CardContent>
    </Card>
);


const SeoPerformanceRechart: React.FC<ComponentProps> = ({ projectId }) => {
    const [metrics, setMetrics] = useState<SeoMetricsResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [period, setPeriod] = useState("CURRENT");
    const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([
        dayjs().subtract(30, "day"),
        dayjs(),
    ]);


    const fetchData = async (start: Dayjs, end: Dayjs) => {
        setLoading(true);
        try {
            const startDate = start.format("YYYY-MM-DD");
            const endDate = end.format("YYYY-MM-DD");

            const res = await keywordService.getSeoMetrics(
                String(projectId),
                startDate,
                endDate
            );
            setMetrics(res);
        } catch (error) {
            console.error("Error fetching SEO metrics:", error);
        } finally {
            setLoading(false);
        }
    };

    //Handle quick period selection (7D, 1M, etc.)
    const handlePeriodChange = (_: any, newPeriod: string) => {
        if (!newPeriod) return;
        setPeriod(newPeriod);

        const now = dayjs();
        let start = now.subtract(30, "day");

        switch (newPeriod) {
            case "7D":
                start = now.subtract(7, "day");
                break;
            case "1M":
                start = now.subtract(1, "month");
                break;
            case "3M":
                start = now.subtract(3, "month");
                break;
            case "6M":
                start = now.subtract(6, "month");
                break;
            case "1Y":
                start = now.subtract(1, "year");
                break;
            default:
                start = now.subtract(30, "day");
        }

        setDateRange([start, now]);
        fetchData(start, now);
    };

    //Initial load (default 30 days)
    useEffect(() => {
        if (dateRange[0] && dateRange[1]) fetchData(dateRange[0], dateRange[1]);
    }, []);

    // UI Rendering
    if (!metrics) {
        return (
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: 300,
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box sx={{ p: 3 }}>
                {/* Period Selector and Date Picker */}
                <Box
                    sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 3,
                        gap: 2,
                    }}
                >
                    <ToggleButtonGroup
                        value={period}
                        exclusive
                        onChange={handlePeriodChange}
                        size="small"
                    >
                        {["CURRENT", "7D", "1M", "3M", "6M", "1Y"].map((p) => (
                            <ToggleButton key={p} value={p}>
                                {p}
                            </ToggleButton>
                        ))}
                    </ToggleButtonGroup>

                    {/* Date Range Picker */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <DateRangePicker
                            value={dateRange}
                            onChange={(newValue) => setDateRange(newValue)}
                        />
                        <Button
                            onClick={() => {
                                if (dateRange[0] && dateRange[1]) {
                                    setPeriod("CUSTOM");
                                    fetchData(dateRange[0], dateRange[1]);
                                }
                            }}
                            variant="contained"
                            disabled={loading}
                        >
                            Apply
                        </Button>
                    </Box>
                </Box>

                {/* Metric Card + Overlay */}
                <Box sx={{ position: "relative", mb: 3 }}>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12,sm: 6, md: 4 }}>
                            <MetricCardItem
                                title="Average Position"
                                value={metrics.average_position}
                            />
                        </Grid>
                    </Grid>

                    {loading && (
                        <Box
                            sx={{
                                position: "absolute",
                                inset: 0,
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                background: "rgba(255,255,255,0.6)",
                                backdropFilter: "blur(2px)",
                                pointerEvents: "none",
                                borderRadius: 2,
                                transition: "opacity 0.3s ease-in-out",
                            }}
                        >
                            <CircularProgress size={30} thickness={4} />
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mt: 1, fontWeight: 500 }}
                            >
                                Updating...
                            </Typography>
                        </Box>
                    )}
                </Box>

                {/* Chart + Overlay */}
                <Box sx={{ position: "relative", height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={metrics.chart_data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis domain={[40, 30]} reversed />
                            <Tooltip />
                            <Line
                                type="monotone"
                                dataKey="avg_position"
                                stroke="#1976d2"
                                strokeWidth={2.5}
                                dot={{ r: 3 }}
                                activeDot={{ r: 6 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>

                    {loading && (
                        <Box
                            sx={{
                                position: "absolute",
                                inset: 0,
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                background: "rgba(255,255,255,0.5)",
                                backdropFilter: "blur(2px)",
                                pointerEvents: "none",
                                transition: "opacity 0.3s ease-in-out",
                            }}
                        >
                            <CircularProgress size={38} thickness={5} />
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mt: 1, fontWeight: 500 }}
                            >
                                Loading new data...
                            </Typography>
                        </Box>
                    )}
                </Box>
            </Box>
        </LocalizationProvider>
    );
};

export default SeoPerformanceRechart;