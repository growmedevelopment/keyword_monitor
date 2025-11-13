import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import type {SeoMetrics} from "./types";

const Chart = ({ metrics }: { metrics: SeoMetrics }) => {
    const values = metrics.chart_data.map((d) => d.avg_position);
    const min = Math.min(...values);
    const max = Math.max(...values);

    const getDotColor = (value: number) => {
        const ratio = (value - min) / (max - min || 1);
        if (value === 0 || ratio >= 0.66) return "#f44336";
        if (ratio >= 0.33) return "#ffb300";
        return "#4caf50";
    };

    return (
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={metrics.chart_data}>
                <defs>
                    <linearGradient id="colorPos" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#1976d2" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="#1976d2" stopOpacity={0} />
                    </linearGradient>
                </defs>

                <XAxis dataKey="date" />
                <YAxis domain={[0, "dataMax"]} />
                <Tooltip />

                <Area
                    type="monotone"
                    dataKey="avg_position"
                    stroke="#1976d2"
                    strokeWidth={2}
                    fill="url(#colorPos)"
                    dot={({ cx, cy, payload }: any) => (
                        <circle
                            cx={cx}
                            cy={cy}
                            r={4}
                            fill={getDotColor(payload.avg_position)}
                            stroke="#fff"
                            strokeWidth={1.5}
                        />
                    )}
                    activeDot={({ cx, cy, payload }: any) => (
                        <circle
                            cx={cx}
                            cy={cy}
                            r={6}
                            fill={getDotColor(payload.avg_position)}
                            stroke="#fff"
                            strokeWidth={2}
                        />
                    )}
                />
            </AreaChart>
        </ResponsiveContainer>
    );
};

export default Chart;