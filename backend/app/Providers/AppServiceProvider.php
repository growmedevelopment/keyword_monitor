<?php

namespace App\Providers;

use App\Models\DataForSeoTask;
use App\Observers\DataForSeoTaskObserver;
use Illuminate\Support\ServiceProvider;
use Laravel\Sanctum\PersonalAccessToken;
use Laravel\Sanctum\Sanctum;
use Illuminate\Support\Facades\Route;
use App\Models\LinkTask;
use App\Observers\BacklinkTaskObserver;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Sanctum::usePersonalAccessTokenModel(PersonalAccessToken::class);

        //observing data for seo tasks
        DataForSeoTask::observe(DataForSeoTaskObserver::class);

        //observing backlink tasks
        LinkTask::observe(BacklinkTaskObserver::class);
    }
}
