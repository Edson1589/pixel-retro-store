<?php

namespace App\Http\Requests\Appointments;

use Illuminate\Foundation\Http\FormRequest;

class StoreAppointmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'service_type'        => ['required', 'in:repair,maintenance,diagnostic'],
            'console'             => ['required', 'string', 'max:40'],
            'problem_description' => ['required', 'string', 'min:5'],
            'location'            => ['required', 'in:shop,home'],
            'address'             => ['nullable', 'required_if:location,home', 'string', 'max:255'],
            'contact_phone'       => ['required', 'string', 'max:40'],
            'preferred_at'        => ['required', 'date', 'after:now'],
            'duration_minutes'    => ['nullable', 'integer', 'min:30', 'max:240'],
            'customer_notes'      => ['nullable', 'string', 'max:255'],
        ];
    }
}
