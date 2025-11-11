{{ $title }}

Hola {{ $appointment->customer->name }},

{{ $bodyLine }}

Detalle:
- Servicio: {{ $appointment->service_type }}
- Consola: {{ $appointment->console }}
- Estado: {{ $appointment->status }}
- Preferida: {{ optional($appointment->preferred_at)->format('Y-m-d H:i') }}
@if ($appointment->scheduled_at)
    - Agendada: {{ $appointment->scheduled_at->format('Y-m-d H:i') }}
@endif
@if ($appointment->reschedule_proposed_at)
    - Propuesta: {{ $appointment->reschedule_proposed_at->format('Y-m-d H:i') }}
@endif

Gracias.
