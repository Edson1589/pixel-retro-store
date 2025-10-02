<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SearchHistory extends Model
{
    protected $fillable = [
        'user_id',
        'session_id',
        'term',
    ];

    /**
     * Relación con el usuario (si existe).
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
