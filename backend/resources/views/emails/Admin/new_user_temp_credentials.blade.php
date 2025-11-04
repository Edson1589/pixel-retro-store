<!doctype html>
<html lang="es">

<head>
    <meta charset="utf-8">
</head>

<body>
    <h2>Bienvenido(a), {{ $user->name }}</h2>
    <p>Se ha creado una cuenta para ti.</p>
    <p><strong>Email:</strong> {{ $user->email }}</p>
    <p><strong>Contraseña temporal:</strong> <code>{{ $tempPassword }}</code></p>
    <p>Ingresa aquí: <a href="{{ $loginUrl }}">{{ $loginUrl }}</a></p>
    <p><em>Al iniciar sesión, deberás cambiar tu contraseña.</em></p>
    <p>— Pixel Retro Store</p>
</body>

</html>
