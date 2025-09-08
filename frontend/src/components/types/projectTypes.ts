import type {Keyword} from "./keywordTypes.ts";


export interface Project {
    id: number;
    name: string;
    url: string;
    country: string;
    location_code: number;
    location_name: string;
    keywords: Keyword[];
    created_at: string;
    deleted_at: string;
}
