export interface KeywordResult {
    type: string;
    rank_absolute: number;
    rank_group: number;
    url: string;
    title: string;
}

export interface KeywordRank {
    id: number;
    keyword_id: number;
    position: number;
    url: string;
    raw: {
        url: string;
        type: string;
        title: string;
        domain: string;
        breadcrumb: string;
        rank_group: number;
        description: string;
        rank_absolute: number;
    };
    tracked_at: string;
    created_at: string;
    updated_at: string;
}

export interface KeywordGroup {
    id: number;
    name: string;
    color: string;
}

export interface Keyword {
    id: number;
    keyword: string;
    status_code: number;
    status_message: string;
    results: KeywordResult;
    keywords_rank : KeywordRank[];
    keyword_group_id: KeywordGroup['id'] | null;
    keyword_group_name: KeywordGroup['name'] | null;
    keyword_group_color : KeywordGroup['color'] | null;
}


