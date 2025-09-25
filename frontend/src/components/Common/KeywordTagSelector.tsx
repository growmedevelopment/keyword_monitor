import { Box, Typography, FormControl, InputLabel, Select, MenuItem, Chip } from "@mui/material";
import tinycolor from "tinycolor2";
import type { KeywordGroup } from "../types/keywordTypes.ts";

type KeywordTagSelectorProps = {
    groups: KeywordGroup[];
    selectedGroupId: number | null;
    onChange: (groupId: number | null) => void;
};

export default function KeywordTagSelector({ groups, selectedGroupId, onChange }: KeywordTagSelectorProps) {
    return (
        <Box display="flex" alignItems="center" mb={3}>
            <Typography variant="subtitle1" sx={{ mr: 2, fontWeight: 600 }}>
                Keyword Tag:
            </Typography>
            <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel id="keyword-group-label">Select Group</InputLabel>
                <Select
                    labelId="keyword-group-label"
                    value={selectedGroupId ?? ""}
                    onChange={(e) => {
                        const groupId = e.target.value ? Number(e.target.value) : null;
                        onChange(groupId);
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
                    <MenuItem value="">None</MenuItem>
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
                                        px: 1.5,
                                        py: 0.5,
                                        borderRadius: 1,
                                        boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                                    }}
                                />
                            </MenuItem>
                        );
                    })}
                </Select>
            </FormControl>
        </Box>
    );
}