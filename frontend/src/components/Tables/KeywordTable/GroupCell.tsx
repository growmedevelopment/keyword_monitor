import { useState } from "react";
import type { ICellRendererParams } from "ag-grid-community";
import type { Keyword, KeywordGroup } from "../../types/keywordTypes";
import KeywordTagSelector from "../../Common/KeywordTagSelector.tsx";
import keywordGroupService from "../../../services/keywordGroupService.ts";
import toast from "react-hot-toast";

export const GroupCell = (
    props: ICellRendererParams<Keyword>
) => {
    const currentGroups = (props.data?.keyword_groups as any) ?? [];
    const [selectedGroupIds, setSelectedGroupIds] = useState<number[]>(
        Array.isArray(currentGroups)
            ? currentGroups.map((g: any) => g.id)
            : []
    );

    async function assignKeywordToGroups(keywordId: number, groupsId: number[]) {
        try {

            const response = await keywordGroupService.setProjectKeywordGroup(keywordId, groupsId);

            if (response.status === "success") {
                toast.success("Groups updated");

                props.data!.keyword_groups = props.context.keywordGroups.filter((g: KeywordGroup) =>
                    groupsId.includes(g.id)
                );
            }
        } catch (error) {
            toast.error("Failed to assign keyword groups");
            console.error(error);
        }
    }

    return (
        <KeywordTagSelector
            groups={props.context.keywordGroups || []}
            selectedGroupIds={selectedGroupIds}
            onChange={(groupsId) => {
                setSelectedGroupIds(groupsId);
                assignKeywordToGroups(props.data!.id, groupsId).then();
            }}
        />
    );
};