<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="utf-8">
    <title>Nota de Entrega #{{ $sale->id }}</title>
    <style>
        body {
            font-family: DejaVu Sans, sans-serif;
            font-size: 12px;
            color: #111;
        }

        .title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 6px;
        }

        .muted {
            color: #666;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }

        th,
        td {
            border: 1px solid #ddd;
            padding: 6px 8px;
        }

        th {
            background: #f5f5f5;
            text-align: left;
        }

        .right {
            text-align: right;
        }

        .totals td {
            border: none;
        }
    </style>
</head>

<body>
    <div class="title">Pixel Retro Store — Nota de Entrega</div>
    <div class="muted">
        Entrega N°: #{{ $sale->id }} &nbsp;|&nbsp;
        Fecha: {{ $sale->created_at->format('d/m/Y H:i') }}
    </div>
    <div class="muted">
        Ref. de pago: {{ $sale->payment_ref ?? '—' }}
        @if ($sale->deliveredBy && $sale->deliveredBy->name)
            &nbsp;|&nbsp; Entregado por: {{ $sale->deliveredBy->name }}
        @endif
    </div>

    <table>
        <tr>
            <th colspan="2">Cliente</th>
        </tr>
        <tr>
            <td>
                <strong>{{ $sale->customer->name ?? 'Cliente' }}</strong><br>
                {{ $sale->customer->email ?? '' }}<br>
                {{ $sale->customer->phone ?? '' }}<br>
                {{ $sale->customer->address ?? '' }}
            </td>
            <td class="right">
                <strong>Tienda</strong><br>
                Pixel Retro Store<br>
                soporte@pixelretro.dev<br>
                http://localhost:5173
            </td>
        </tr>
    </table>

    <table>
        <thead>
            <tr>
                <th>Producto</th>
                <th class="right">Cantidad</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($sale->details as $d)
                <tr>
                    <td>{{ $d->product->name ?? '#' . $d->product_id }}</td>
                    <td class="right">{{ $d->quantity }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <table style="margin-top:16px;">
        <tr>
            <td style="height:70px; width:50%;">
                <strong>Recibido por:</strong><br><br>
                Firma: ___________________________<br>
                Nombre: __________________________
            </td>
            <td style="height:70px; width:50%;">
                <strong>Entregado por:</strong><br><br>
                Firma: ___________________________<br>
                Nombre: __________________________
            </td>
        </tr>
    </table>

    <p class="muted" style="margin-top:10px">
        Esta nota certifica la entrega de los artículos listados.
    </p>
</body>

</html>
