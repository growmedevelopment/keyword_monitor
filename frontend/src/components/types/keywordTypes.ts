// types/keywordTypes.ts
export interface KeywordResult {
    rank_absolute: number;
    rank_group: number;
    url: string;
    title: string;
}

export interface Keyword {
    id: number;
    keyword: string;
    status: 'Queued' | 'Completed' | 'Submitted';
    results: KeywordResult[];
}
