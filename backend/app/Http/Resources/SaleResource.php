<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class SaleResource extends JsonResource
{
    public function toArray($request)
    {
        $itemsQty = $this->items_qty
            ?? ($this->relationLoaded('details') ? (int)$this->details->sum('quantity') : null);

        return [
            'id'          => $this->id,
            'status'      => $this->status,
            'payment_ref' => $this->payment_ref,
            'total'       => (float)$this->total,
            'items_qty'   => $itemsQty,
            'created_at'  => optional($this->created_at)->toISOString(),

            'customer' => $this->whenLoaded('customer', fn() => [
                'id'    => $this->customer->id,
                'name'  => $this->customer->name,
                'email' => $this->customer->email,
            ]),

            'user' => $this->whenLoaded('user', fn() => [
                'id'   => $this->user->id,
                'name' => $this->user->name,
            ]),

            'details' => SaleDetailResource::collection($this->whenLoaded('details')),
        ];
    }
}
