import { useState } from "react";
import type { ICellRendererParams } from "ag-grid-community";
import type { Keyword, KeywordGroup } from "../../types/keywordTypes";
import KeywordTagSelector from "../../Common/KeywordTagSelector.tsx";
import keywordGroupService from "../../../services/keywordGroupService.ts";
import toast from "react-hot-toast";

export const GroupCell = (
    props: ICellRendererParams<Keyword> & { groups: KeywordGroup[] }
) => {
    const [selectedGroupId, setSelectedGroupId] = useState<number | null>(
        props.data?.keyword_group_id ?? null
    );

    async function assignKeywordToGroup(keywordId: number, groupId: number | null) {
        try {
            if (!groupId) {
                const response = await keywordGroupService.unsetProjectKeywordGroup(keywordId);
                if (response.status === "success") {
                    toast.success(response.message);
                    setSelectedGroupId(null);
                }
                return;
            }
            const response = await keywordGroupService.setProjectKeywordGroup(keywordId, groupId);
            if (response.status === "success") {
                toast.success(response.message);
            }
        } catch (error) {
            toast.error("Failed to assign keyword group");
            console.error(error);
        }
    }

    return (
        <KeywordTagSelector
            groups={props.context.keywordGroups || []}
            selectedGroupId={selectedGroupId}
            onChange={(groupId) => {
                setSelectedGroupId(groupId);
                assignKeywordToGroup(props.data!.id, groupId).then();
            }}
        />
    );
};