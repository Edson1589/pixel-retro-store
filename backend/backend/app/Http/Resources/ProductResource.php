<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'sku' => $this->sku,
            'category' => [
                'id' => $this->category_id,
                'name' => optional($this->category)->name,
                'slug' => optional($this->category)->slug,
            ],
            'price' => $this->price,
            'currency' => $this->currency,
            'condition' => $this->condition,
            'stock' => $this->stock,
            'images' => $this->images ?? [],
        ];
    }
}
