<?php

namespace App\Enums;

enum LinkType: string {
    case Backlinks = 'backlinks';
    case Citations = 'citations';
}
