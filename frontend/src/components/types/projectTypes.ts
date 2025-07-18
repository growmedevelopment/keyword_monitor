export interface Project {
    id: number;
    name: string;
    url: string;
    country: string;
    location_code: number;
    keywords: {
        keyword: string;
        results: {
            rank_absolute: number;
            url: string;
            title: string;
        }[];
    }[];
}
