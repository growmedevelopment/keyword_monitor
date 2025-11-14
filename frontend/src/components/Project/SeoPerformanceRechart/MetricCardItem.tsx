import { Card, CardContent, Typography } from "@mui/material";

const MetricCardItem = ({
                            title,
                            value,
                        }: {
    title: string;
    value: number | string;
}) => (
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

export default MetricCardItem;