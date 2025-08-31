<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Product extends Model
{
    protected $fillable = [
        'category_id',
        'name',
        'slug',
        'sku',
        'description',
        'price',
        'stock',
        'condition',
        'is_unique',
        'image_url',
        'status'
    ];
    protected $casts = [
        'is_unique' => 'boolean',
        'price' => 'float', // para que el frontend reciba número
    ];
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }
}
