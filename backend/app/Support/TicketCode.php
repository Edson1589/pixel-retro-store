<?php

namespace App\Support;

use App\Models\EventRegistration;
use Illuminate\Support\Str;

class TicketCode
{
    public static function generateUnique(): string
    {
        $alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
        do {
            $part = collect(range(1, 8))
                ->map(fn() => $alphabet[random_int(0, strlen($alphabet) - 1)])
                ->join('');
            $code = 'PRS-' . $part . '-' . now()->format('y');
        } while (EventRegistration::where('ticket_code', $code)->exists());

        return $code;
    }
}
