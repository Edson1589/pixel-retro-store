@php($start = optional($ev->start_at)->format('d/m/Y H:i'))
<!doctype html>
<html lang="es">

<head>
    <meta charset="utf-8">
</head>

<body>
    <h2>Tu registro cambió de estado</h2>

    <p><strong>Evento:</strong> {{ $ev->title }}</p>
    @if ($start)
        <p><strong>Fecha:</strong> {{ $start }}</p>
    @endif
    @if ($ev->location)
        <p><strong>Lugar:</strong> {{ $ev->location }}</p>
    @endif

    <p>Hola {{ $reg->name }}, tu registro ahora está:
        <strong>{{ strtoupper($reg->status) }}</strong>.
    </p>

    @if ($reg->status === 'confirmed')
        <p style="margin:16px 0 8px 0;"><strong>Tu ticket / código de acceso:</strong></p>
        <p
            style="font-size:18px; font-weight:bold; letter-spacing:1px; padding:10px 12px; border:1px dashed #7C3AED; display:inline-block;">
            {{ $reg->ticket_code }}
        </p>
        <p style="color:#667085; font-size:13px; margin-top:10px;">
            Guarda este código. Te lo pueden solicitar en el ingreso.
        </p>
    @elseif($reg->status === 'cancelled')
        <p>Tu registro fue cancelado. Si crees que es un error, responde a este correo.</p>
    @else
        <p>Tu registro quedó en pendiente. Te avisaremos cualquier novedad.</p>
    @endif

    <p style="margin-top:18px;">— Pixel Retro Store</p>
</body>

</html>
