<?php

namespace App\Providers;

use Illuminate\Support\Facades\Gate;
use Laravel\Telescope\Telescope;
use Laravel\Telescope\TelescopeApplicationServiceProvider;

class TelescopeServiceProvider extends TelescopeApplicationServiceProvider
{
    public function register(): void
    {
        Telescope::night();
        $this->hideSensitiveRequestDetails();
        Telescope::filter(static fn () => true);
    }

    // 🔓 Open to everyone (remove when done!)
    public function boot(): void
    {
        parent::boot();
        Telescope::auth(static fn () => true);
    }

    protected function hideSensitiveRequestDetails(): void
    {
        if ($this->app->environment('local')) {
            return;
        }

        Telescope::hideRequestParameters(['_token']);
        Telescope::hideRequestHeaders(['cookie','x-csrf-token','x-xsrf-token']);
    }

    // Irrelevant when we force-allow, can keep or delete
    protected function gate(): void
    {
        Gate::define('viewTelescope', static fn () => false);
    }
}
