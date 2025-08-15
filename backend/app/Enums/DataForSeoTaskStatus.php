<?php

namespace App\Enums;

class DataForSeoTaskStatus
{
    public const SUBMITTED = 20100; // Task created
    public const COMPLETED = 20000; // Task finished
    public const FAILED    = 40000; // Error
    public const QUEUED = 40400;
}
