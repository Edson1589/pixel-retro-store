@php($start = optional($ev->start_at)->format('d/m/Y H:i'))
<!doctype html>
<html lang="es">

<head>
    <meta charset="utf-8">
</head>

<body>
    <h2>¡Gracias por registrarte!</h2>
    <p><strong>Evento:</strong> {{ $ev->title }}</p>
    @if ($start)
        <p><strong>Fecha:</strong> {{ $start }}</p>
    @endif
    @if ($ev->location)
        <p><strong>Lugar:</strong> {{ $ev->location }}</p>
    @endif

    <p>Hola {{ $reg->name }}, recibimos tu registro y está <strong>PENDIENTE</strong> de confirmación.
        Te avisaremos por correo cuando sea <em>confirmado</em> o si se <em>cancela</em>.</p>

    <p>Detalles enviados:<br>
        Email: {{ $reg->email }}<br>
        Gamer tag: {{ $reg->gamer_tag ?? '—' }}<br>
        Equipo: {{ $reg->team ?? '—' }}</p>

    <p>— Pixel Retro Store</p>
</body>

</html>
