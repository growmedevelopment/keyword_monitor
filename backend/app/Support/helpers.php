<?php


if (!function_exists('filterDataForSeoItemsByHost')) {

    function filterDataForSeoItemsByHost(array $items, string $project_url): ?array
    {
        $projectDomain = parse_url($project_url, PHP_URL_HOST);
        $projectDomain = str_ireplace('www.', '', $projectDomain); // Normalize

        $result = collect($items)
            ->filter(function ($item) use ($projectDomain) {
                if (!isset($item['domain'], $item['rank_group'])) {
                    return false;
                }

                $itemDomain = str_ireplace('www.', '', $item['domain']);

                return $itemDomain === $projectDomain;
            })
            ->sortBy('rank_group')
            ->first();

        return $result ?? [
            "type"          => "no results",
            "rank_group"    => 0,
            "rank_absolute" => 0,
            "domain"        => "",
            "title"         => "no results",
            "description"   => "no results",
            "url"           => "",
            "breadcrumb"    => "",
        ];
    }
}
