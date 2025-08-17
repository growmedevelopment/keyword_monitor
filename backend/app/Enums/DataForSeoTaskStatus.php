<?php

namespace App\Enums;

class DataForSeoTaskStatus
{
    public const int SUBMITTED = 20100; // Task created

    public const int PROCESSING = 40601; // Task handed
    public const int QUEUED = 40602; //Task in queue
    public const int COMPLETED = 20000; // Task completed
}
