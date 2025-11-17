<?php

namespace App\Http\Requests\Payments;

use Illuminate\Foundation\Http\FormRequest;

class CreateIntentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'customer.name'    => ['required', 'string', 'max:150'],
            'customer.email'   => ['required', 'email', 'max:255'],
            'customer.phone'   => ['nullable', 'string', 'max:40'],
            'customer.address' => ['nullable', 'string', 'max:255'],
            'customer.ci'      => ['nullable', 'string', 'max:50'],

            'items'                => ['required', 'array', 'min:1'],
            'items.*.product_id'   => ['required', 'integer', 'exists:products,id'],
            'items.*.qty'          => ['required', 'integer', 'min:1'],

            'amount'          => ['nullable', 'integer', 'min:1'],
            'currency'        => ['nullable', 'string', 'max:10'],
            'pickup_doc_b64'  => ['nullable', 'string'],
        ];
    }
}
