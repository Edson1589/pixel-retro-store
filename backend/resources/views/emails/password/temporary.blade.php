<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Recuperación de contraseña</title>
</head>
<body style="background-color:#0f172a; color:#e2e8f0; font-family: Arial, sans-serif; padding: 32px 16px; margin: 0;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="100%" style="max-width: 520px; background-color:#1e293b; border-radius:12px;">
        <tr>
            <td style="padding: 24px 32px;">
                <h2 style="color: #06b6d4; text-align: center; margin-top: 0;">🔐 Recuperación de contraseña</h2>
                <p>Hola,</p>
                <p>Has solicitado recuperar tu contraseña en <strong>Pixel Retro Store</strong>.</p>

                <p>Tu nueva contraseña temporal es:</p>

                <div style="text-align: center; margin: 24px 0;">
                    <span style="display:inline-block; font-size:20px; background:#06b6d4; color:#ffffff; padding:12px 18px; border-radius:8px; font-weight:bold; letter-spacing:0.5px;">
                        {{ $tempPassword }}
                    </span>
                </div>

                <p>Por motivos de seguridad, deberás cambiarla la próxima vez que inicies sesión.</p>

                <p style="margin-top: 32px;">Gracias,<br>
                <strong>El equipo de Pixel Retro Store</strong></p>
            </td>
        </tr>
    </table>
</body>
</html>
