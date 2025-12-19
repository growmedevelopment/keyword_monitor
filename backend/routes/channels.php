<?php
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('backlinks.{projectId}', function ($user, $projectId) {
    return true;
});
