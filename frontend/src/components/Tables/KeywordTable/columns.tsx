import type { ColDef, ICellRendererParams, ValueGetterParams } from 'ag-grid-community';
import CircularProgress from '@mui/material/CircularProgress';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import type { Keyword } from '../../types/keywordTypes';
import RemoveKeywordCell from "./RemoveKeywordCell.tsx";

dayjs.extend(utc);
dayjs.extend(timezone);

const timezoneLabel = 'America/Edmonton';

type Result = {
    rank_group: number;
    url: string;
    tracked_at: string;
};

function resultsArray(k: Keyword): Result[] {
    const r = (k as unknown as { results?: Result | Result[] }).results;
    if (!r) return [];
    return Array.isArray(r) ? r : [r];
}

function dateKey(daysAgo: number): string {
    return dayjs().tz(timezoneLabel).subtract(daysAgo, 'day').format('YYYY-MM-DD');
}

function groupByDate(k: Keyword): Record<string, Result> {
    return resultsArray(k).reduce((acc, result) => {
        const key = dayjs.tz(result.tracked_at, timezoneLabel).format('YYYY-MM-DD');
        if (!acc[key] || dayjs.tz(result.tracked_at, timezoneLabel).isAfter(acc[key].tracked_at)) {
            acc[key] = result;
        }
        return acc;
    }, {} as Record<string, Result>);
}

function positionOn(params: ValueGetterParams<Keyword>, daysAgo: number): string | number {
    const byDate = groupByDate(params.data!);
    const rank = byDate[dateKey(daysAgo)]?.rank_group;
    if (rank === 0) return 101;
    return typeof rank === 'number' ? rank : '-';
}

function urlForToday(params: ValueGetterParams<Keyword>): string | undefined {
    const byDate = groupByDate(params.data!);
    return (
        byDate[dateKey(0)]?.url ||
        resultsArray(params.data!)
            .sort((a, b) => dayjs.tz(b.tracked_at, timezoneLabel).valueOf() - dayjs.tz(a.tracked_at, timezoneLabel).valueOf())[0]?.url
    );
}

function numericPosition(data: Keyword, daysAgo: number): number | string {
    const rank = groupByDate(data)[dateKey(daysAgo)]?.rank_group;
    if (rank === 0) return 101;
    return typeof rank === 'number' ? rank : '-';
}

const COLORS = {
    improved: '#2e7d32',
    worse: '#d32f2f',
    neutral: '#757575',
};

const PositionWithTrend = (daysAgo: number) => (p: ICellRendererParams<Keyword>) => {
    const results = (p.data as any)?.results;
    if (!results || (Array.isArray(results) && results.length === 0)) {
        return <CircularProgress size={18} />;
    }

    const curr = numericPosition(p.data!, daysAgo);
    const prev = numericPosition(p.data!, daysAgo + 1);

    if (curr === '-') return <span>–</span>;
    if (prev === '-') return <span>{curr}</span>;

    const delta = (prev as number) - (curr as number);
    const color = delta > 0 ? COLORS.improved : delta < 0 ? COLORS.worse : COLORS.neutral;
    const symbol = delta > 0 ? '▲' : delta < 0 ? '▼' : '▬';

    return (
        <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }} title={`Change vs previous day: ${delta > 0 ? `+${delta}` : delta}`}>
      <span>{curr}</span>
      <span style={{ color, fontSize: 12 }}>{symbol} {Math.abs(delta)}</span>
    </span>
    );
};

function headerLabel(daysAgo: number, locale = 'en-CA'): string {
    const d = dayjs().tz(timezoneLabel).subtract(daysAgo, 'day').toDate();
    const fmt = new Intl.DateTimeFormat(locale, { timeZone: timezoneLabel, month: 'long', day: '2-digit' });
    const parts = fmt.formatToParts(d);
    const dayPart = parts.find(p => p.type === 'day')?.value ?? '';
    const monthPart = parts.find(p => p.type === 'month')?.value ?? '';
    return `${dayPart} ${monthPart}`;
}

const twoDaysAgo = headerLabel(2);
const threeDaysAgo = headerLabel(3);

const posComparator = (a: any, b: any) => {
    if (a === '-' || a == null) return b === '-' || b == null ? 0 : 1;
    if (b === '-' || b == null) return -1;
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
        headerName: 'URL',
        width: 90,
        filter: false,
        valueGetter: urlForToday,
        cellRenderer: (p: ICellRendererParams) => {
            const value = p.value;
            if (value === undefined) return <CircularProgress size={18} />;
            if (typeof value === 'string' && value.length > 0) {
                return (
                    <a href={value} target="_blank" rel="noopener noreferrer" aria-label="Open result URL" title="Open URL">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
                            <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
                                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                            </g>
                        </svg>
                    </a>
                );
            }
            return null;
        },
    },
    { headerName: 'Today', width: 130,
        valueGetter: p => positionOn(p, 0),
        comparator: posComparator,
        cellRenderer: PositionWithTrend(0)
    },
    { headerName: 'Yesterday', width: 130, valueGetter: p => positionOn(p, 1), comparator: posComparator, cellRenderer: PositionWithTrend(1) },
    { headerName: twoDaysAgo, width: 130, valueGetter: p => positionOn(p, 2), comparator: posComparator, cellRenderer: PositionWithTrend(2) },
    { headerName: threeDaysAgo, width: 130, valueGetter: p => positionOn(p, 3), comparator: posComparator, cellRenderer: PositionWithTrend(3) },
    {
        headerName: 'Remove',
        width: 110,
        sortable: false,
        filter: false,
        suppressNavigable: true,
        cellRenderer: RemoveKeywordCell,
        cellStyle: { display: 'flex', alignItems: 'center' },
    }
];