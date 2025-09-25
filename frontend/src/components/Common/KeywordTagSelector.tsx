import { Select, MenuItem, Chip } from "@mui/material";
import tinycolor from "tinycolor2";
import type { KeywordGroup } from "../types/keywordTypes.ts";

type KeywordTagSelectorProps = {
    groups: KeywordGroup[];
    selectedGroupId: number | null;
    onChange: (groupId: number | null) => void;
};

export default function KeywordTagSelector({groups, selectedGroupId, onChange,}: KeywordTagSelectorProps) {
    return (
        <Select
            value={selectedGroupId ?? ""}
            onChange={(e) => {
                const groupId = e.target.value ? Number(e.target.value) : null;
                onChange(groupId);
            }}
            displayEmpty
            size="small"
            variant="outlined"
            sx={{
                minWidth: 120,
                height: 32, // make it compact for table
                fontSize: "0.85rem",
                "& .MuiSelect-select": {
                    py: 0.5,
                },
            }}
            MenuProps={{
                PaperProps: {
                    style: {
                        maxHeight: 250,
                        overflowY: "auto",
                    },
                },
            }}
        >
            <MenuItem value="">
                <em>None</em>
            </MenuItem>
            {groups.map((group) => {
                const bgColor = group.color || "#ccc";
                const textColor = tinycolor(bgColor).isLight() ? "#000" : "#fff";

                return (
                    <MenuItem key={group.id} value={group.id}>
                        <Chip
                            label={group.name}
                            sx={{
                                backgroundColor: bgColor,
                                color: textColor,
                                fontWeight: 500,
                                borderRadius: 1,
                                px: 0.5,
                                height: 22,
                            }}
                            size="small"
                        />
                    </MenuItem>
                );
            })}
        </Select>
    );
}