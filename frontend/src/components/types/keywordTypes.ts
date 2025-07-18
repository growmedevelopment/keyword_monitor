// types/keywordTypes.ts
export interface KeywordResult {
    rank_absolute: number;
    title: string;
    url: string;
}

export interface Keyword {
    id: number;
    keyword: string;
    results: KeywordResult[];
}