import { Box, Button } from "@mui/material";
import { DayPicker } from "react-day-picker";
import type { DateRange } from "react-day-picker";
import dayjs, { Dayjs } from "dayjs";
import "react-day-picker/dist/style.css";
import { useState, useEffect } from "react";

interface Props {
    initialRange: [Dayjs | null, Dayjs | null];
    mode: "range" | "compare";
    onApply: (range: [Dayjs, Dayjs], mode: "range" | "compare") => void;
}

export default function CalendarPicker({ initialRange, mode, onApply }: Props) {

    const [pickerMode, setPickerMode] = useState(mode);

    const [range, setRange] = useState<DateRange>({
        from: initialRange[0]?.toDate() ?? undefined,
        to: initialRange[1]?.toDate() ?? undefined,
    });

    const [compareDates, setCompareDates] = useState<Date[]>([]);
    const [currentMonth, setCurrentMonth] = useState<Date>(
        initialRange[0]?.toDate() ?? new Date()
    );

    // -----------------------------
    // PRESETS
    // -----------------------------
    const presets = [
        {
            label: "YESTERDAY",
            value: [dayjs().subtract(1, "day"), dayjs().subtract(1, "day")]
        },
        {
            label: "LAST 2 DAYS",
            value: [dayjs().subtract(2, "day"), dayjs()]
        },
        {
            label: "7D",
            value: [dayjs().subtract(7, "day"), dayjs()]
        },
        {
            label: "1M",
            value: [dayjs().subtract(1, "month"), dayjs()]
        },
        {
            label: "3M",
            value: [dayjs().subtract(3, "month"), dayjs()]
        },
        {
            label: "6M",
            value: [dayjs().subtract(6, "month"), dayjs()]
        },
        {
            label: "1Y",
            value: [dayjs().subtract(12, "month"), dayjs()]
        },
    ];

    // -----------------------------
    // Active preset detection
    // -----------------------------
    const isActivePreset = (preset: [Dayjs, Dayjs]) => {
        if (pickerMode !== "range") return false; // <<< NEW RULE

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

    // sync internal UI to parent changes
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

    const apply = () => {
        if (pickerMode === "range" && range.from && range.to) {
            onApply([dayjs(range.from), dayjs(range.to)], "range");
            return;
        }

        if (pickerMode === "compare" && compareDates.length === 2) {
            onApply([dayjs(compareDates[0]), dayjs(compareDates[1])], "compare");
        }
    };

    return (
        <Box>

            {/* ● PRESETS */}
            <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
                {presets.map((p) => {
                    const presetValue = p.value as [Dayjs, Dayjs];

                    const isActive = isActivePreset(presetValue);

                    return (
                        <Button
                            key={p.label}
                            variant={isActive ? "contained" : "outlined"}
                            size="small"
                            onClick={() => applyPreset(presetValue)}
                        >
                            {p.label}
                        </Button>
                    );
                })}
            </Box>

            {/* ● MODE SWITCH */}
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

            {/* ● CALENDAR */}
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
                />
            )}

            {/* ● APPLY BUTTON */}
            <Button onClick={apply} variant="contained" sx={{ mt: 2 }}>
                Apply
            </Button>
        </Box>
    );
}