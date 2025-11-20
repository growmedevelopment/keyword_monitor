export interface KeywordResult {
    tracked_at: string;
    type: string;
    rank_absolute: number;
    position: number;
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
    project_id: number;
}

export interface Keyword {
    id: number;
    keyword: string;
    status_code: number;
    status_message: string;
    project_id: number;
    results: KeywordResult[];
    keywords_rank : KeywordRank[];
    keyword_groups: KeywordGroup;
    keyword_group_id: KeywordGroup['id'] | null;
    keyword_group_name: KeywordGroup['name'] | null;
    keyword_group_color : KeywordGroup['color'] | null;
    created_at: string;
}


