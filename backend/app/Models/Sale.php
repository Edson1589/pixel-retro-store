<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Sale extends Model
{
    public function user()
    {
        return $this->belongsTo(\App\Models\User::class);
    }

    protected $fillable = [
        'user_id',
        'customer_id',
        'total',
        'status',
        'payment_ref',
        'delivery_status',
        'delivered_at',
        'delivered_by',
        'is_canceled',
        'canceled_at',
        'canceled_by',
        'cancel_reason',
        'pickup_doc_path',
    ];

    public function details(): HasMany
    {
        return $this->hasMany(SaleDetail::class);
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function deliveredBy()
    {
        return $this->belongsTo(\App\Models\User::class, 'delivered_by');
    }

    public function canceledBy()
    {
        return $this->belongsTo(\App\Models\User::class, 'canceled_by');
    }
}
