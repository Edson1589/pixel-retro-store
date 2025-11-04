<!doctype html>
<html lang="es">

<head>
    <meta charset="utf-8">
</head>

<body>
    <h2>Recuperación de acceso</h2>
    <p>Hola {{ $user->name ?? 'cliente' }},</p>
    <p>Esta es tu <strong>contraseña temporal</strong> para iniciar sesión:</p>
    <p style="font-family:monospace;font-size:18px;border:1px dashed #7C3AED;display:inline-block;padding:8px 12px;">
        {{ $temp }}
    </p>
    <p>Vence: <strong>{{ $expiresAt->format('d/m/Y H:i') }}</strong></p>
    <p>Ingresa aquí: <a href="{{ $loginUrl }}">{{ $loginUrl }}</a></p>
    <p style="color:#667085;font-size:13px;">Al iniciar sesión el sistema te pedirá cambiarla.</p>
    <p>— Pixel Retro Store</p>
</body>

</html>
