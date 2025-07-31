import { Box, Skeleton, Typography } from "@mui/material";
import type {ReactNode} from "react";

interface DataStateHandlerProps<T> {
    loading: boolean;
    error: string | null;
    data: T | null;
    emptyMessage?: string;
    children: (data: T) => ReactNode; // <-- function returning JSX
}

export default function DataStateHandler<T>({loading, error, data, emptyMessage = "No data found", children,}: DataStateHandlerProps<T>) {
    if (loading) {
        return (
            <Box p={3}>
                <Skeleton variant="text" width={200} height={40} />
                <Skeleton variant="rectangular" height={120} sx={{ mt: 2 }} />
            </Box>
        );
    }

    if (error) {
        return <Typography color="error">{error}</Typography>;
    }

    if (!data) {
        return <Typography>{emptyMessage}</Typography>;
    }


    return <>{children(data)}</>;
}