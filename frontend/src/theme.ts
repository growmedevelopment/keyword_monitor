// theme.ts
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#1976d2',
        },
        secondary: {
            main: '#9c27b0',
        },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8, // optional global shape
                    textTransform: "none", // remove uppercase
                    fontWeight: 600,
                },
                contained: {
                    backgroundColor: "#4caf50",
                    color: "#fff",
                    "&:hover": {
                        backgroundColor: "#6fbf73",
                    },
                    borderRadius: 4,
                },
                outlined: {
                    borderColor: "#4caf50",
                    color: "#1A453A",
                    "&:hover": {
                        backgroundColor: "rgba(26, 69, 58, 0.08)",
                    },
                },
            },
        },
    },
});

export default theme;