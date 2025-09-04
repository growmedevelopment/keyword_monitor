import * as React from 'react';
import {
    IconButton,
    Button,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    CircularProgress,
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

export type ConfirmDeleteButtonProps = {
    /** Called when user confirms. If it throws, the dialog stays open and loading stops. */
    onConfirm: () => Promise<void> | void;

    /** Button label in dialog’s primary action (default: "Remove") */
    confirmLabel?: string;

    /** Dialog title (default: "Remove item?") */
    title?: string;

    /** Dialog content text (keep it short). */
    description?: React.ReactNode;

    /** Tooltip over the trigger button (default: "Remove") */
    tooltip?: string;

    /** Render as IconButton (default) or as text Button */
    variant?: 'icon' | 'button';

    /** Disable trigger */
    disabled?: boolean;

    /** Color for the action button (default: "error") */
    color?: 'error' | 'primary' | 'secondary' | 'inherit';

    /** Optional callback after successful deletion */
    onDeleted?: () => void;

    /** Optional callback when deletion fails */
    onError?: (err: unknown) => void;

    /** aria-label for the trigger button */
    ariaLabel?: string;

    /** If variant = button, children is the trigger label; if absent uses confirmLabel */
    children?: React.ReactNode;
};

export default function ConfirmDeleteButton({
                                                onConfirm,
                                                confirmLabel = 'Remove',
                                                title = 'Remove item?',
                                                description = 'This action is permanent and cannot be undone.',
                                                tooltip = 'Remove',
                                                variant = 'icon',
                                                disabled,
                                                color = 'error',
                                                onDeleted,
                                                onError,
                                                ariaLabel = 'remove',
                                                children,
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
        variant === 'icon' ? (
            <Tooltip title={tooltip}>
        <span>
          <IconButton color={color} size="small" onClick={handleOpen} disabled={disabled || loading} aria-label={ariaLabel}>
            {loading ? <CircularProgress size={18} /> : <DeleteOutlineIcon fontSize="small" />}
          </IconButton>
        </span>
            </Tooltip>
        ) : (
            <Button
                color={color}
                variant="outlined"
                onClick={handleOpen}
                disabled={disabled || loading}
                startIcon={loading ? <CircularProgress size={18} /> : <DeleteOutlineIcon />}
                sx={{ textTransform: 'none' }}
            >
                {children ?? confirmLabel}
            </Button>
        );

    return (
        <>
            {Trigger}

            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>{title}</DialogTitle>
                <DialogContent>{description}</DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button onClick={handleConfirm} color={color} variant="contained" disabled={loading}>
                        {loading ? 'Removing…' : confirmLabel}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}