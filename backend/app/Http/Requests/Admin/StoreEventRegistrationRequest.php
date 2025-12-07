<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreEventRegistrationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'       => ['required', 'string', 'max:150'],
            'email'      => ['required', 'email', 'max:255'],
            'gamer_tag'  => ['nullable', 'string', 'max:80'],
            'team'       => ['nullable', 'string', 'max:120'],
            'notes'      => ['nullable', 'string', 'max:1000'],

            'status'     => ['nullable', 'in:pending,confirmed,cancelled'],
            'force'      => ['sometimes', 'boolean'],
            'send_email' => ['sometimes', 'boolean'],
            'check_in'   => ['sometimes', 'boolean'],

            'user_id'    => ['nullable', 'integer', 'exists:users,id'],
        ];
    }
}
