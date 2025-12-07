<!doctype html>
<html lang="es">

<head>
    <meta charset="utf-8">
</head>

<body>
    <h2>Acceso temporal</h2>
    <p>Hola {{ $user->name ?? 'usuario' }},</p>
    <p>Solicitaste recuperar el acceso administrativo. Esta es tu contraseña temporal:</p>
    <p style="font-family:monospace;font-size:18px;border:1px dashed #7C3AED;display:inline-block;padding:8px 12px;">
        {{ $temp }}
    </p>
    <p>Vence: <strong>{{ $expiresAt->format('d/m/Y H:i') }}</strong></p>
    <p>Ingresa aquí: <a href="{{ $loginUrl }}">{{ $loginUrl }}</a></p>
    <p style="color:#667085;font-size:13px;">Al iniciar sesión se te pedirá cambiarla por una segura.</p>
    <p>— Pixel Retro Store</p>
</body>

</html>
