<?php

namespace App\Http\Requests\Appointments;

use Illuminate\Foundation\Http\FormRequest;

class RescheduleAppointmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'proposed_at' => ['required', 'date', 'after:now'],
            'note'        => ['nullable', 'string', 'max:255'],
            'duration_minutes' => ['nullable', 'integer', 'min:30', 'max:240'],
        ];
    }
}
