import type { ColDef, ICellRendererParams, ValueGetterParams } from 'ag-grid-community';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import type { Keyword } from '../../types/keywordTypes';

dayjs.extend(utc);
dayjs.extend(timezone);

const TZ = 'America/Edmonton';

// --- Minimal types (adjust names to your backend if needed)
type Result = {
    position?: number | null;
    url?: string | null;
    tracked_at: string; // ISO
};

// Normalize results to an array (handles single object or missing)
function resultsArray(k: Keyword): Result[] {
    const r: any = (k as any).results;
    if (!r) return [];
    return Array.isArray(r) ? r : [r];
}

// Build YYYY-MM-DD (Edmonton) -> latest result for that day
function groupByDate(k: Keyword): Record<string, Result> {
    const res = resultsArray(k);
    const map: Record<string, Result> = {};
    for (const r of res) {
        const key = dayjs.tz(r.tracked_at, TZ).format('YYYY-MM-DD');
        const cur = map[key];
        if (!cur || dayjs.tz(r.tracked_at, TZ).valueOf() > dayjs.tz(cur.tracked_at, TZ).valueOf()) {
            map[key] = r;
        }
    }
    return map;
}

// Helpers for cell values
function positionOn(params: ValueGetterParams<Keyword>, daysAgo: number): number | string {
    const key = dayjs().tz(TZ).subtract(daysAgo, 'day').format('YYYY-MM-DD');
    const byDate = groupByDate(params.data!);
    return byDate[key]?.position ?? '-';
}

function urlForToday(params: ValueGetterParams<Keyword>): string | undefined {
    const k = params.data!;
    const byDate = groupByDate(k);
    const todayKey = dayjs().tz(TZ).format('YYYY-MM-DD');
    const today = byDate[todayKey]?.url;
    if (today) return today;

    // fallback: latest overall (by Edmonton time)
    let latest: Result | undefined;
    for (const r of resultsArray(k)) {
        if (!latest || dayjs.tz(r.tracked_at, TZ).valueOf() > dayjs.tz(latest.tracked_at, TZ).valueOf()) latest = r;
    }
    return latest?.url ?? undefined;
}

// ---- per-cell trend helpers (compare D vs D+1) ----
function numericPosition(data: Keyword, daysAgo: number): number | null {
    const key = dayjs().tz(TZ).subtract(daysAgo, 'day').format('YYYY-MM-DD');
    const byDate = groupByDate(data);
    const v = byDate[key]?.position;
    return typeof v === 'number' ? v : null;
}

// renderer factory: shows "value  ▲2/▼3/▬0" comparing D vs D+1 (Edmonton days)
const PositionWithTrend =
    (daysAgo: number) =>
        (p: ICellRendererParams<Keyword>) => {
            const curr = numericPosition(p.data as Keyword, daysAgo);
            const prev = numericPosition(p.data as Keyword, daysAgo + 1);

            // if no current value, show dash; if no previous, just the number
            if (curr == null) return <span>–</span>;
            if (prev == null) return <span>{curr}</span>;

            const delta = prev - curr; // positive = improved (moved up)
            const improved = delta > 0;
            const worse = delta < 0;

            const color = improved ? '#2e7d32' : worse ? '#d32f2f' : '#757575';
            const symbol = improved ? '▲' : worse ? '▼' : '▬';

            return (
                <span
                    style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}
                    title={`Change vs previous day: ${delta > 0 ? `+${delta}` : delta}`}
                >
        <span>{curr}</span>
        <span style={{ color, fontSize: 12 }}>
          {symbol} {Math.abs(delta)}
        </span>
      </span>
            );
        };

// ---- Localized headers via Intl.DateTimeFormat.formatToParts (Edmonton) ----
function headerLabel(daysAgo: number, locale = 'en-CA'): string {
    const d = dayjs().tz(TZ).subtract(daysAgo, 'day').toDate();
    const fmt = new Intl.DateTimeFormat(locale, { timeZone: TZ, month: 'long', day: '2-digit' });
    const parts = fmt.formatToParts(d);
    const dayPart = parts.find(p => p.type === 'day')?.value ?? '';
    const monthPart = parts.find(p => p.type === 'month')?.value ?? '';
    return `${dayPart} ${monthPart}`; // e.g., "12 August"
}

const twoDaysAgo = headerLabel(2);
const threeDaysAgo = headerLabel(3);

// Sorting that pushes '-' to bottom
const posComparator = (a: any, b: any) => {
    const na = a === '-' || a == null,
        nb = b === '-' || b == null;
    if (na && nb) return 0;
    if (na) return 1;
    if (nb) return -1;
    return Number(a) - Number(b);
};

type LinkCellParams = ICellRendererParams<Keyword, string> & { data: Keyword };

export const columnDefs: ColDef<Keyword>[] = [
    {
        field: 'keyword',
        headerName: 'Keyword',
        width: 200,
        sort: 'asc',
        cellRenderer: (p: LinkCellParams) => (
            <a href={`/keywords/${p.data.id}`} style={{ color: '#1976d2', textDecoration: 'none' }}>
                {p.value}
            </a>
        ),
    },
    {
        field: 'status',
        headerName: 'Status',
        width: 120,
        cellRenderer: (p: LinkCellParams) => {
            const isLoading = p.value !== 'Completed';
            return <span style={{ color: isLoading ? '#ff9800' : '#2e7d32' }}>{p.value}</span>;
        },
    },
    {
        headerName: 'URL',
        width: 90,
        valueGetter: urlForToday,
        cellRenderer: (p: ICellRendererParams) =>
            p.value ? (
                <a href={p.value as string} target="_blank" rel="noopener noreferrer" title="Open URL">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
                        <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
                            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                        </g>
                    </svg>
                </a>
            ) : null,
    },

    // Positions with inline trend vs previous day (all Edmonton-local)
    { headerName: 'Today',      width: 130, valueGetter: p => positionOn(p, 0), comparator: posComparator, cellRenderer: PositionWithTrend(0) },
    { headerName: 'Yesterday',  width: 130, valueGetter: p => positionOn(p, 1), comparator: posComparator, cellRenderer: PositionWithTrend(1) },
    { headerName: twoDaysAgo,   width: 130, valueGetter: p => positionOn(p, 2), comparator: posComparator, cellRenderer: PositionWithTrend(2) },
    { headerName: threeDaysAgo, width: 130, valueGetter: p => positionOn(p, 3), comparator: posComparator, cellRenderer: PositionWithTrend(3) },
];