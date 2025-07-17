export interface Project {
    id: number;
    name: string;
    url: string;
    country: string;
    location_code: number;
}

export type CountryOption = {
    label: string;
    value: string;
};

export type CityOption = {
    label: string;
    value: number;
};