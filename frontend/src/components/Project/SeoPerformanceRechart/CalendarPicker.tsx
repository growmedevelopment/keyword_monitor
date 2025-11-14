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


    useEffect(() => {
        setPickerMode(mode);

        const from: Date | undefined = initialRange[0]?.toDate() ?? undefined;
        const to: Date | undefined = initialRange[1]?.toDate() ?? undefined;

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
            {/* Mode Switcher */}
            <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                <Button
                    variant={pickerMode === "range" ? "contained" : "outlined"}
                    size="small"
                    onClick={() => {
                        setPickerMode("range");

                        const from = initialRange[0]?.toDate() ?? undefined;
                        const to = initialRange[1]?.toDate() ?? undefined;

                        setRange({ from, to });
                        setCurrentMonth(from ?? new Date());
                    }}
                >
                    Range
                </Button>

                <Button
                    variant={pickerMode === "compare" ? "contained" : "outlined"}
                    size="small"
                    onClick={() => {
                        setPickerMode("compare");

                        const from = initialRange[0]?.toDate();
                        const to = initialRange[1]?.toDate();

                        const list = [from, to].filter(Boolean) as Date[];
                        setCompareDates(list);
                        setCurrentMonth(from ?? new Date());
                    }}
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