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

    protected $fillable = ['user_id', 'customer_id', 'total', 'status', 'payment_ref'];

    public function details(): HasMany
    {
        return $this->hasMany(SaleDetail::class);
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }
}
