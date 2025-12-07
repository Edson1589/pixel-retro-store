<?php

namespace App\Http\Requests\Payments;

use Illuminate\Foundation\Http\FormRequest;

class ConfirmIntentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'client_secret' => ['required', 'string'],
            'card_number'   => ['required', 'string'],
            'exp_month'     => ['required', 'integer', 'between:1,12'],
            'exp_year'      => ['required', 'integer', 'min:2024'],
            'cvc'           => ['required', 'string', 'min:3', 'max:4'],
        ];
    }
}
