@php($start = optional($ev->start_at)->format('d/m/Y H:i'))
<!doctype html>
<html lang="es">

<head>
    <meta charset="utf-8">
</head>

<body>
    <h2>Nuevo registro recibido</h2>
    <p><strong>Evento:</strong> {{ $ev->title }}</p>
    @if ($start)
        <p><strong>Fecha:</strong> {{ $start }}</p>
    @endif
    @if ($ev->location)
        <p><strong>Lugar:</strong> {{ $ev->location }}</p>
    @endif

    <p><strong>Nombre:</strong> {{ $reg->name }}<br>
        <strong>Email:</strong> {{ $reg->email }}<br>
        <strong>Gamer tag:</strong> {{ $reg->gamer_tag ?? '—' }}<br>
        <strong>Equipo:</strong> {{ $reg->team ?? '—' }}
    </p>

    <p>Estado actual: <strong>{{ strtoupper($reg->status) }}</strong></p>

    <p>Administración: revisa y cambia el estado en el panel.</p>

    <p>— Pixel Retro Store</p>
</body>

</html>
