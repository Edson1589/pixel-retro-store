<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    protected $fillable = [
        'provider',
        'intent_id',
        'client_secret',
        'amount',
        'currency',
        'status',
        'failure_reason',
        'method',
        'brand',
        'last4',
        'requires_action',
        'next_action',
        'expires_at',
        'sale_id',
        'metadata',
    ];

    protected $casts = [
        'amount' => 'integer',
        'requires_action' => 'boolean',
        'expires_at' => 'datetime',
        'metadata' => 'array',
    ];

    public function sale(): BelongsTo
    {
        return $this->belongsTo(Sale::class);
    }
}
