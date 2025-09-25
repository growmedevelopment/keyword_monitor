import { Button } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";

type BackButtonProps = {
    fallbackPath?: string;
    label?: string;
};

export default function BackButton({ fallbackPath = "/", label = "Back" }: BackButtonProps) {
    const navigate = useNavigate();

    const handleClick = () => {

        navigate(-1);

        setTimeout(() => {
            if (window.location.pathname === window.location.pathname) {
                navigate(fallbackPath);
            }
        }, 50);
    };

    return (
        <Button
            startIcon={<ArrowBackIcon />}
            onClick={handleClick}
            sx={{ mr: 2 }}
        >
            {label}
        </Button>
    );
}