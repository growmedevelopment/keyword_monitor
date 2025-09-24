import * as React from "react";
import {
    IconButton,
    Button,
    Tooltip,
    CircularProgress,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ConfirmDialog from "../Common/ConfirmDialog.tsx";

export type ConfirmDeleteButtonProps = {
    onConfirm: () => Promise<void> | void;
    confirmLabel?: string;
    title?: string;
    description?: React.ReactNode;
    tooltip?: string;
    variant?: "icon" | "button";
    disabled?: boolean;
    color?: "error" | "primary" | "secondary" | "inherit";
    onDeleted?: () => void;
    onError?: (err: unknown) => void;
    ariaLabel?: string;
    children?: React.ReactNode;
    icon?: React.ReactElement;
};

export default function ConfirmDeleteButton({
                                                onConfirm,
                                                confirmLabel = "Remove",
                                                title = "Remove item?",
                                                description = "This action is permanent and cannot be undone.",
                                                tooltip = "Remove",
                                                variant = "icon",
                                                disabled,
                                                color = "error",
                                                onDeleted,
                                                onError,
                                                ariaLabel = "remove",
                                                children,
                                                icon,
                                            }: ConfirmDeleteButtonProps) {
    const [open, setOpen] = React.useState(false);
    const [loading, setLoading] = React.useState(false);

    const handleOpen = () => !disabled && setOpen(true);
    const handleClose = () => !loading && setOpen(false);

    const handleConfirm = async () => {
        try {
            setLoading(true);
            await onConfirm();
            onDeleted?.();
            setOpen(false);
        } catch (err) {
            onError?.(err);
            // keep dialog open so user can retry or cancel
        } finally {
            setLoading(false);
        }
    };

    const Trigger =
        variant === "icon" ? (
            <Tooltip title={tooltip}>
        <span>
          <IconButton
              color={color}
              size="small"
              onClick={handleOpen}
              disabled={disabled || loading}
              aria-label={ariaLabel}
          >
            {loading ? (
                <CircularProgress size={18} />
            ) : (
                icon ?? <DeleteOutlineIcon fontSize="small" />
            )}
          </IconButton>
        </span>
            </Tooltip>
        ) : (
            <Button
                color={color}
                variant="outlined"
                onClick={handleOpen}
                disabled={disabled || loading}
                startIcon={
                    loading ? <CircularProgress size={18} /> : icon ?? <DeleteOutlineIcon />
                }
                sx={{ textTransform: "none" }}
            >
                {children ?? confirmLabel}
            </Button>
        );

    return (
        <>
            {Trigger}

            <ConfirmDialog
                open={open}
                title={title}
                description={description}
                confirmLabel={confirmLabel}
                cancelLabel="Cancel"
                onConfirm={handleConfirm}
                onCancel={handleClose}
            />
        </>
    );
}