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
                'ci'      => $this->customer->ci,
                'email' => $this->customer->email,
                'phone'   => $this->customer->phone,
                'address' => $this->customer->address,
            ]),

            'user' => $this->whenLoaded('user', fn() => [
                'id'   => $this->user->id,
                'name' => $this->user->name,
            ]),

            'delivery_status' => $this->delivery_status,
            'delivered_at'    => optional($this->delivered_at)->toISOString(),

            'is_canceled'     => (bool) $this->is_canceled,
            'canceled_at'     => optional($this->canceled_at)->toISOString(),
            'cancel_reason'   => $this->cancel_reason,

            'delivered_by' => $this->whenLoaded('deliveredBy', fn() => [
                'id'   => $this->deliveredBy->id,
                'name' => $this->deliveredBy->name,
            ]),
            'canceled_by' => $this->whenLoaded('canceledBy', fn() => [
                'id'   => $this->canceledBy->id,
                'name' => $this->canceledBy->name,
            ]),

            'pickup_doc_url' => $this->pickup_doc_path
                ? route('admin.sales.pickupDoc', ['sale' => $this->id])
                : null,

            'details' => SaleDetailResource::collection($this->whenLoaded('details')),
        ];
    }
}
