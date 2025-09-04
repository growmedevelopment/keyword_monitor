import type { ICellRendererParams } from 'ag-grid-community';
import toast from 'react-hot-toast';
import type { Keyword } from '../../types/keywordTypes';
import ConfirmDeleteButton from "../ConfirmDeleteButton.tsx";
import keywordService from "../../../services/keywordService.ts";

type Context = {
    /** Project id can be provided via grid context, or carried on each row as data.project_id */
    projectId?: number | string;
    /** Optional callback for external state sync */
    onKeywordRemoved?: (id: number | string) => void;
};

type Props = ICellRendererParams<Keyword, any> & { context: Context };

export default function RemoveKeywordCell(p: Props) {
    const keywordId = p.data?.id;

    if (!keywordId) return null;

    return (
        <ConfirmDeleteButton
            variant="icon"
            tooltip="Remove keyword"
            title="Remove keyword?"
            description="This will permanently delete this keyword and its related data. This action cannot be undone."
            confirmLabel="Remove"
            ariaLabel="remove keyword"
            onConfirm={async () => {

                const response = await keywordService.deleteFromProject(keywordId);

                if (p.api && p.data) p.api.applyTransaction({ remove: [p.data] });
                p.context?.onKeywordRemoved?.(keywordId);

                if (response.status === "success") {
                    toast.success(response.message)
                } else {
                    toast.error(response.message)
                }
            }}
        />
    );
}