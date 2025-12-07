<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class SaleDetailResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id'         => $this->id,
            'product'    => $this->whenLoaded('product', fn() => [
                'id'        => $this->product_id,
                'name'      => $this->product?->name,
                'sku'       => $this->product?->sku,
                'image_url' => $this->product?->image_url,
            ]),
            'quantity'   => (int)$this->quantity,
            'unit_price' => (float)$this->unit_price,
            'subtotal'   => (float)$this->subtotal,
        ];
    }
}
