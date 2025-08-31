<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Sale extends Model
{
    protected $fillable = ['customer_id', 'total', 'status', 'payment_ref'];
    public function details(): HasMany
    {
        return $this->hasMany(SaleDetail::class);
    }
}
