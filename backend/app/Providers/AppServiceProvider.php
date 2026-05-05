<?php

namespace App\Providers;

use App\Models\LinkTask;
use App\Observers\BacklinkTaskObserver;
use Illuminate\Support\ServiceProvider;
use Laravel\Sanctum\PersonalAccessToken;
use Laravel\Sanctum\Sanctum;

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

        // observing backlink tasks
        LinkTask::observe(BacklinkTaskObserver::class);
    }
}
