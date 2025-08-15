<?php

namespace App\Enums;

class DataForSeoTaskStatus
{
    public const SUBMITTED = 20100; // Task created

    public const PROCESSING = 40601; // Task handed
    public const QUEUED = 40602; //Task in queue
    public const COMPLETED = 20000; // Task completed
}
