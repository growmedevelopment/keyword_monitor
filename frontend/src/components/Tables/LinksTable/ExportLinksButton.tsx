import { Button } from "@mui/material";
import DownloadIcon from '@mui/icons-material/Download';
import toast from "react-hot-toast";
import type { LinkItem } from "../../../services/linkService.ts";
interface ExportLinksButtonProps {
    links: LinkItem[];
    type: string;
    disabled?: boolean;
}

export default function ExportLinksButton({ links, type, disabled = false }: ExportLinksButtonProps) {

    const handleExportCsv = () => {
        if (!links || links.length === 0) {
            toast.error("No data to export");
            return;
        }

        // 1. Define Headers
        const headers = ["URL", "Type", "HTTP Code", "Indexed", "Checked At"];

        // 2. Map Data
        const rows = links.map(link => {
            const result = link.latest_result || {};

            // Safe Date Formatting
            const dateStr = result.checked_at ? new Date(result.checked_at).toLocaleString() : '';

            // Safe Boolean Formatting
            let indexedStr = '';
            if (result.indexed !== null && result.indexed !== undefined) {
                indexedStr = result.indexed ? 'Yes' : 'No';
            }

            return [
                link.url,
                link.type,
                result.http_code ?? '',
                indexedStr,
                dateStr
            ];
        });

        // 3. Construct CSV String (handling quotes/commas)
        const csvContent = [
            headers.join(','),
            ...rows.map(row =>
                row.map(item => `"${String(item || '').replace(/"/g, '""')}"`).join(',')
            )
        ].join('\n');

        // 4. Trigger Browser Download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const linkElem = document.createElement('a');
        linkElem.href = url;
        linkElem.setAttribute('download', `${type}_export_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(linkElem);
        linkElem.click();
        document.body.removeChild(linkElem);
    };

    return (
        <Button
            variant="text"
            disabled={disabled}
            onClick={handleExportCsv}
            startIcon={<DownloadIcon />}
            sx={{ mr: 2 }}
        >
            Export CSV
        </Button>
    );
}