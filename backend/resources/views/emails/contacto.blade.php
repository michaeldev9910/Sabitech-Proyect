<!doctype html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <title>{{ $asunto }}</title>
</head>
<body style="margin:0; padding:24px; background:#F5F7FA; font-family:Arial, Helvetica, sans-serif; color:#14283D;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; margin:0 auto; background:#FFFFFF; border:1px solid #DCE3EA; border-radius:12px;">
        <tr>
            <td style="padding:20px 24px; background:#14283D; border-radius:12px 12px 0 0; color:#FFFFFF; font-size:18px; font-weight:bold;">
                Nuevo mensaje de contacto
            </td>
        </tr>
        <tr>
            <td style="padding:24px;">
                <p style="margin:0 0 6px;"><strong>Nombre:</strong> {{ $nombre }}</p>
                <p style="margin:0 0 6px;"><strong>Correo:</strong> <a href="mailto:{{ $email }}" style="color:#168C8C;">{{ $email }}</a></p>
                <p style="margin:0 0 18px;"><strong>Asunto:</strong> {{ $asunto }}</p>
                <p style="margin:0 0 6px;"><strong>Mensaje:</strong></p>
                <p style="margin:0; padding:14px 16px; background:#F1F4F7; border-radius:8px; line-height:1.5;">{!! nl2br(e($mensaje)) !!}</p>
            </td>
        </tr>
        <tr>
            <td style="padding:14px 24px; border-top:1px solid #DCE3EA; color:#5B6B7A; font-size:12px;">
                Enviado desde el formulario de contacto de Sabitech. Puedes responder directamente a este correo.
            </td>
        </tr>
    </table>
</body>
</html>
