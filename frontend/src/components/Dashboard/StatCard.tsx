import type {ReactNode} from "react";
import {alpha, Box, Card, CardContent, Skeleton, Stack, Typography, useTheme} from "@mui/material";
import IconBadge from "./IconBadge.tsx";

export default function StatCard(props: {
    title: string;
    value: number;
    loading?: boolean;
    icon: ReactNode;
    color: string;
    subtitle?: string;
}) {
    const { title, value, loading, icon, color, subtitle } = props;
    const theme = useTheme();

    return (
        <Card
            elevation={0}
            sx={{
                position: 'relative',
                overflow: 'hidden',
                borderRadius: 2,
                height: '100%',
                border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
                bgcolor:
                    theme.palette.mode === 'light'
                        ? theme.palette.common.white
                        : alpha(theme.palette.background.paper, 0.6),
                backdropFilter: 'saturate(180%) blur(6px)',
                '&::after': {
                    content: '""',
                    position: 'absolute',
                    inset: -40,
                    background: `radial-gradient(120px 120px at 10% 0%, ${alpha(
                        color,
                        0.25
                    )} 0%, transparent 60%)`,
                    pointerEvents: 'none',
                },
            }}
        >
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Stack direction="row" alignItems="center" spacing={2}>
                    <IconBadge color={color}>{icon}</IconBadge>

                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="overline" color="text.secondary">
                            {title}
                        </Typography>

                        {loading ? (
                            <Skeleton variant="text" width={120} height={36} sx={{ fontSize: 28 }} />
                        ) : (
                            <Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1.1 }}>
                                {value.toLocaleString()}
                            </Typography>
                        )}

                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            {loading ? <Skeleton variant="text" width={200} /> : subtitle}
                        </Typography>
                    </Box>
                </Stack>
            </CardContent>
        </Card>
    );
}
