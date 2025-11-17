import {Box, Button, Popover, Typography} from "@mui/material";
import { DayPicker } from "react-day-picker";
import type { DateRange } from "react-day-picker";
import dayjs, { Dayjs } from "dayjs";
import "react-day-picker/dist/style.css";
import { useState, useEffect } from "react";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";

interface Props {
    initialRange: [Dayjs | null, Dayjs | null];
    mode: "range" | "compare";
    onApply: (range: [Dayjs, Dayjs], mode: "range" | "compare") => void;
}

export default function CalendarPicker({ initialRange, mode, onApply }: Props) {

    // -----------------------------
    // STATE
    // -----------------------------
    const [pickerMode, setPickerMode] = useState(mode);
    const [compareDates, setCompareDates] = useState<Date[]>([]);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const [range, setRange] = useState<DateRange>({
        from: initialRange[0]?.toDate() ?? undefined,
        to: initialRange[1]?.toDate() ?? undefined,
    });

    const [currentMonth, setCurrentMonth] = useState<Date>(
        initialRange[0]?.toDate() ?? new Date()
    );

    const open = Boolean(anchorEl);

    // -----------------------------
    // PRESETS
    // -----------------------------
    const presets = [
        { label: "YESTERDAY", value: [dayjs().subtract(1, "day"), dayjs().subtract(1, "day")] },
        { label: "LAST 2 DAYS", value: [dayjs().subtract(2, "day"), dayjs()] },
        { label: "7D", value: [dayjs().subtract(7, "day"), dayjs()] },
        { label: "1M", value: [dayjs().subtract(1, "month"), dayjs()] },
        { label: "3M", value: [dayjs().subtract(3, "month"), dayjs()] },
        { label: "6M", value: [dayjs().subtract(6, "month"), dayjs()] },
        { label: "1Y", value: [dayjs().subtract(12, "month"), dayjs()] }
    ];

    const isActivePreset = (preset: [Dayjs, Dayjs]) => {
        if (pickerMode !== "range") return false;
        if (!range.from || !range.to) return false;

        return (
            dayjs(range.from).isSame(preset[0], "day") &&
            dayjs(range.to).isSame(preset[1], "day")
        );
    };

    const applyPreset = (preset: [Dayjs, Dayjs]) => {
        setPickerMode("range");

        const from = preset[0].toDate();
        const to = preset[1].toDate();

        setRange({ from, to });
        setCurrentMonth(from);
    };

    // -----------------------------
    // SYNC WITH PARENT
    // -----------------------------
    useEffect(() => {
        setPickerMode(mode);

        const from = initialRange[0]?.toDate() ?? undefined;
        const to = initialRange[1]?.toDate() ?? undefined;

        if (mode === "range") {
            setRange({ from, to });
            setCurrentMonth(from ?? new Date());
        }

        if (mode === "compare") {
            const list = [from, to].filter(Boolean) as Date[];
            setCompareDates(list);
            setCurrentMonth(from ?? new Date());
        }
    }, [mode, initialRange]);

    // -----------------------------
    // APPLY BUTTON
    // -----------------------------
    const apply = () => {
        if (pickerMode === "range" && range.from && range.to) {
            onApply([dayjs(range.from), dayjs(range.to)], "range");
            setAnchorEl(null);
            return;
        }

        if (pickerMode === "compare" && compareDates.length === 2) {
            onApply([dayjs(compareDates[0]), dayjs(compareDates[1])], "compare");
            setAnchorEl(null);
        }
    };

    // -----------------------------
    // DATE LABEL FOR INPUT
    // -----------------------------
    const renderLabel = () => {
        if (pickerMode === "range") {
            if (!range.from || !range.to) return "Select date range";
            return `${dayjs(range.from).format("MMM D")} – ${dayjs(range.to).format("MMM D")}`;
        }

        if (pickerMode === "compare") {
            if (compareDates.length < 2) return "Select 2 dates to compare";
            return `${dayjs(compareDates[0]).format("MMM D")} vs ${dayjs(compareDates[1]).format("MMM D")}`;
        }

        return "";
    };

    // -----------------------------
    // RENDER
    // -----------------------------
    return (
        <Box className="calendar-picker">

            {/* CLICKABLE INPUT */}
            <Box sx={{ mb: 2, display: "flex",  gap: 1, alignItems: "center", justifyContent: "end" }}>
                <Typography
                    sx={{
                        fontSize: "0.85rem",
                        fontWeight: 600,
                        color: "text.secondary",
                    }}
                >
                    Chosen dates :
                </Typography>

                <Button
                    sx={{ display: "flex",  gap: 1, alignItems: "center", justifyContent: "space-between", borderRadius: 1 }}
                    variant="outlined"
                    onClick={(e) => setAnchorEl(e.currentTarget)}
                >
                    <CalendarMonthIcon fontSize="small" />
                    {renderLabel()}
                </Button>
            </Box>


            {/* POPOVER CALENDAR */}
            <Popover
                open={open}
                anchorEl={anchorEl}
                onClose={() => setAnchorEl(null)}
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "left",
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
            >
                <Box sx={{ p: 2, maxWidth: 900 }}>

                    {/* PRESETS */}
                    <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
                        {presets.map((p) => {
                            const v = p.value as [Dayjs, Dayjs];
                            const active = isActivePreset(v);

                            return (
                                <Button
                                    key={p.label}
                                    variant={active ? "contained" : "outlined"}
                                    size="small"
                                    onClick={() => applyPreset(v)}
                                >
                                    {p.label}
                                </Button>
                            );
                        })}
                    </Box>

                    {/* MODE SWITCH */}
                    <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                        <Button
                            variant={pickerMode === "range" ? "contained" : "outlined"}
                            size="small"
                            onClick={() => setPickerMode("range")}
                        >
                            Range
                        </Button>

                        <Button
                            variant={pickerMode === "compare" ? "contained" : "outlined"}
                            size="small"
                            onClick={() => setPickerMode("compare")}
                        >
                            Compare
                        </Button>
                    </Box>

                    {/* CALENDAR */}
                    {pickerMode === "range" && (
                        <DayPicker
                            mode="range"
                            selected={range}
                            onSelect={(r) => {
                                if (!r) return;
                                setRange(r);
                                if (r.from) setCurrentMonth(r.from);
                            }}
                            numberOfMonths={2}
                            month={currentMonth}
                            onMonthChange={setCurrentMonth}
                            disabled={{ after: new Date() }}
                            endMonth={new Date()}
                        />
                    )}

                    {pickerMode === "compare" && (
                        <DayPicker
                            mode="multiple"
                            max={2}
                            selected={compareDates}
                            onSelect={(dates) => {
                                const list = dates ?? [];
                                setCompareDates(list);
                                if (list.length > 0) setCurrentMonth(list[0]);
                            }}
                            numberOfMonths={2}
                            month={currentMonth}
                            onMonthChange={setCurrentMonth}
                            disabled={{ after: new Date() }}
                            endMonth={new Date()}
                        />
                    )}

                    {/* APPLY */}
                    <Button
                        onClick={apply}
                        variant="contained"
                        fullWidth
                        sx={{ mt: 2 }}
                    >
                        Apply
                    </Button>

                </Box>
            </Popover>
        </Box>
    );
}