import type {Keyword, KeywordGroup} from "./keywordTypes.ts";


export interface Project {
    id: number;
    name: string;
    url: string;
    country: string;
    location_code: number;
    location_name: string;
    keywords: Keyword[];
    keyword_groups: KeywordGroup[];
    mode: 'range' | 'compare';
    created_at: string;
    deleted_at: string;
}
