import React, { useEffect, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    ToggleButton,
    ToggleButtonGroup,
    CircularProgress,
    Button,
} from "@mui/material";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { DateRangePicker } from "@mui/x-date-pickers-pro/DateRangePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import keywordService, { type SeoMetricsResponse } from "../../services/keywordService.ts";


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
            const res = await keywordService.getSeoMetrics(String(projectId), startDate, endDate);
            setMetrics(res);
        } catch (error) {
            console.error("Error fetching SEO metrics:", error);
        } finally {
            setLoading(false);
        }
    };

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

    useEffect(() => {
        if (dateRange[0] && dateRange[1]) fetchData(dateRange[0], dateRange[1]);
    }, []);

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
            <Box sx={{ p: 3, bgcolor: "background.paper",
                borderRadius: 2,
                boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.1)",
                mt: 2, mb: 2}} >
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
                    <ToggleButtonGroup value={period} exclusive onChange={handlePeriodChange} size="small">
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
                            shouldDisableDate={(date) => date.isAfter(dayjs(), "day")}
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
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                            <MetricCardItem title="Average Position" value={metrics.average_position} />
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
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontWeight: 500 }}>
                                Updating...
                            </Typography>
                        </Box>
                    )}
                </Box>

                {/* Area Chart + Overlay */}
                <Box sx={{ position: "relative", height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%" >
                        <AreaChart data={metrics.chart_data} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorPosition" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#1976d2" stopOpacity={0.4} />  {/* top — stronger */}
                                    <stop offset="100%" stopColor="#1976d2" stopOpacity={0} />  {/* bottom — fades out */}
                                </linearGradient>
                            </defs>

                            <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9e9e9e" />
                            <YAxis domain={[0, "dataMax + 1"]} tick={{ fontSize: 12 }} stroke="#9e9e9e" />
                            <Tooltip
                                formatter={(value: number) => [`${value}`, "Avg Position"]}
                                contentStyle={{ borderRadius: 8, borderColor: "#1976d2" }}
                            />
                            <Area
                                type="monotone"
                                dataKey="avg_position"
                                stroke="#1976d2"
                                strokeWidth={2.5}
                                fill="url(#colorPosition)"
                                fillOpacity={1}
                                dot={({ cx, cy, payload, index }) => {
                                    const value = payload.avg_position;
                                    const values = metrics.chart_data.map((d) => d.avg_position);
                                    const min = Math.min(...values);
                                    const max = Math.max(...values);
                                    const ratio = (value - min) / (max - min || 1);
                                    let fill = "#4caf50"; // green by default

                                    if (ratio < 0.33) fill = "#4caf50"; // good (green)
                                    else if (ratio < 0.66) fill = "#ffb300"; // average (yellow)
                                    else fill = "#f44336"; // poor (red)

                                    return (
                                        <circle
                                            key={`dot-${index}`}
                                            cx={cx}
                                            cy={cy}
                                            r={4}
                                            fill={fill}
                                            stroke="#fff"
                                            strokeWidth={1.5}
                                        />
                                    );
                                }}
                                activeDot={({ cx, cy, payload, index }) => {
                                    const value = payload.avg_position;
                                    const values = metrics.chart_data.map((d) => d.avg_position);
                                    const min = Math.min(...values);
                                    const max = Math.max(...values);
                                    const ratio = (value - min) / (max - min || 1);
                                    let fill = "#4caf50";

                                    if (ratio < 0.33) fill = "#4caf50";
                                    else if (ratio < 0.66) fill = "#ffb300";
                                    else fill = "#f44336";

                                    return (
                                        <circle
                                            key={`dot-${index}`}
                                            cx={cx}
                                            cy={cy}
                                            r={6}
                                            fill={fill}
                                            stroke="#fff"
                                            strokeWidth={2}
                                        />
                                    );
                                }}
                            />
                        </AreaChart>
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
                                borderRadius: 2,
                            }}
                        >
                            <CircularProgress size={38} thickness={5} />
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontWeight: 500 }}>
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