import { Select, MenuItem, Chip, Checkbox, ListItemText, Box, Tooltip, Typography, type SelectChangeEvent } from "@mui/material";
import tinycolor from "tinycolor2";
import type { KeywordGroup } from "../types/keywordTypes.ts";

type KeywordTagSelectorProps = {
    groups: KeywordGroup[];
    selectedGroupIds: number[];
    onChange: (groupIds: number[]) => void;
    collapsed?: boolean;
};

export default function KeywordTagSelector({
                                               groups,
                                               selectedGroupIds = [],
                                               onChange,
                                               collapsed = true // Default to true
                                           }: KeywordTagSelectorProps) {

    const handleChange = (event: SelectChangeEvent<number[]>) => {
        const { target: { value } } = event;
        onChange(typeof value === 'string' ? value.split(',').map(Number) : value);
    };

    return (
        <Select
            multiple
            value={selectedGroupIds}
            onChange={handleChange}
            size="small"
            variant="outlined"
            displayEmpty
            renderValue={(selected) => {
                if (selected.length === 0) return <Typography variant="caption" color="textSecondary">None</Typography>;

                // --- OPTION A: COLLAPSED VIEW (Default) ---
                if (collapsed) {
                    const firstId = selected[0];
                    const firstGroup = groups.find(g => g.id === firstId);
                    const remainingCount = selected.length - 1;

                    const remainingNames = selected.slice(1)
                        .map(id => groups.find(g => g.id === id)?.name)
                        .filter(Boolean)
                        .join(", ");

                    if (!firstGroup) return null;

                    const bgColor = firstGroup.color || "#ccc";
                    const textColor = tinycolor(bgColor).isLight() ? "#000" : "#fff";

                    return (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Chip
                                label={firstGroup.name}
                                size="small"
                                sx={{ backgroundColor: bgColor, color: textColor, height: 20, fontSize: "0.75rem", maxWidth: 100 }}
                            />
                            {remainingCount > 0 && (
                                <Tooltip title={remainingNames} arrow>
                                    <Chip
                                        label={`+${remainingCount}`}
                                        size="small"
                                        variant="outlined"
                                        sx={{ height: 20, fontSize: "0.7rem", color: 'text.secondary' }}
                                    />
                                </Tooltip>
                            )}
                        </Box>
                    );
                }

                // --- OPTION B: FULL VIEW (collapsed={false}) ---
                return (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((id) => {
                            const group = groups.find(g => g.id === id);
                            if (!group) return null;
                            const bgColor = group.color || "#ccc";
                            const textColor = tinycolor(bgColor).isLight() ? "#000" : "#fff";

                            return (
                                <Chip
                                    key={id}
                                    label={group.name}
                                    size="small"
                                    sx={{ backgroundColor: bgColor, color: textColor, height: 20, fontSize: "0.75rem" }}
                                />
                            );
                        })}
                    </Box>
                );
            }}
            sx={{
                minWidth: collapsed ? 120 : 200, // Wider if not collapsed
                maxWidth: collapsed ? 180 : 'none',
                minHeight: 32,
                fontSize: "0.85rem",
                "& .MuiSelect-select": {
                    py: 0.5,
                    display: 'flex',
                    alignItems: 'center',
                    pr: '24px !important'
                },
                // Remove border if in a table (collapsed) for cleaner look
                "& fieldset": collapsed ? { border: 'none' } : {},
            }}
            MenuProps={{
                PaperProps: { style: { maxHeight: 250, width: 250 } },
            }}
        >
            {groups.map((group) => {
                const isChecked = selectedGroupIds.indexOf(group.id) > -1;
                const bgColor = group.color || "#ccc";
                const textColor = tinycolor(bgColor).isLight() ? "#000" : "#fff";

                return (
                    <MenuItem key={group.id} value={group.id}>
                        <Checkbox checked={isChecked} size="small" />
                        <ListItemText>
                            <Chip
                                label={group.name}
                                sx={{ backgroundColor: bgColor, color: textColor, fontWeight: 500, borderRadius: 1, px: 0.5, height: 22 }}
                                size="small"
                            />
                        </ListItemText>
                    </MenuItem>
                );
            })}
        </Select>
    );
}