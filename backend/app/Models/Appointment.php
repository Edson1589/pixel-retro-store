<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Builder;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class Appointment extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'customer_id',
        'technician_id',
        'service_type',
        'console',
        'problem_description',
        'location',
        'address',
        'contact_phone',
        'preferred_at',
        'scheduled_at',
        'duration_minutes',
        'status',
        'reschedule_proposed_at',
        'reschedule_note',
        'reject_reason',
        'customer_notes',
    ];

    protected $casts = [
        'preferred_at' => 'datetime',
        'scheduled_at' => 'datetime',
        'reschedule_proposed_at' => 'datetime',
    ];

    public function customer()
    {
        return $this->belongsTo(User::class, 'customer_id');
    }
    public function technician()
    {
        return $this->belongsTo(User::class, 'technician_id');
    }

    public function scopeOverlaps(Builder $q, int $techId, Carbon $start, int $minutes): Builder
    {
        $end = (clone $start)->addMinutes($minutes);

        return $q->where('technician_id', $techId)
            ->whereIn('status', ['confirmed', 'rescheduled'])
            ->whereNotNull('scheduled_at')
            ->where(function ($qq) use ($start, $end) {
                $qq->whereBetween('scheduled_at', [$start, $end])
                    ->orWhereBetween(
                        DB::raw("DATE_ADD(scheduled_at, INTERVAL duration_minutes MINUTE)"),
                        [$start, $end]
                    )
                    ->orWhere(function ($q3) use ($start, $end) {
                        $q3->where('scheduled_at', '<=', $start)
                            ->whereRaw("DATE_ADD(scheduled_at, INTERVAL duration_minutes MINUTE) >= ?", [$end]);
                    });
            });
    }
}
