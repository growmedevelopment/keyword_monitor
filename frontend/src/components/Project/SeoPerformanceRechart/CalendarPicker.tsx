import { useState } from "react";
import { Box, Button } from "@mui/material";
import { DayPicker } from "react-day-picker";
import type { DateRange } from "react-day-picker";
import dayjs, { Dayjs } from "dayjs";
import "react-day-picker/dist/style.css";
interface Props {
    initialRange: [Dayjs | null, Dayjs | null];
    mode: "range" | "compare";
    onApply: (range: [Dayjs, Dayjs], mode: "range" | "compare") => void;
}

export default function CalendarPicker({ initialRange, mode, onApply }: Props) {
    const [pickerMode, setPickerMode] = useState(mode);

    const [range, setRange] = useState<DateRange>({
        from: initialRange[0]?.toDate(),
        to: initialRange[1]?.toDate(),
    });

    const [compareDates, setCompareDates] = useState<Date[]>([]);
    const [currentMonth, setCurrentMonth] = useState<Date>(
        initialRange[0]?.toDate() ?? new Date()
    );

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
            {/* Mode Switcher */}
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

            {/* Calendar */}
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
                        const d = dates ?? [];
                        setCompareDates(d);
                        if (d.length > 0) setCurrentMonth(d[0]);
                    }}
                    numberOfMonths={2}
                    month={currentMonth}
                    onMonthChange={setCurrentMonth}
                />
            )}

            <Button onClick={apply} variant="contained" sx={{ mt: 2 }}>
                Apply
            </Button>
        </Box>
    );
}