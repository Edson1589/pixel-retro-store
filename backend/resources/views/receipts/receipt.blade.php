<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="utf-8">
    <title>Recibo #{{ $sale->id }}</title>
    <style>
        body {
            font-family: DejaVu Sans, sans-serif;
            font-size: 12px;
            color: #111;
        }

        .wrap {
            width: 100%;
        }

        .header {
            margin-bottom: 16px;
        }

        .title {
            font-size: 18px;
            font-weight: bold;
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

        .totals td {
            border: none;
        }

        .right {
            text-align: right;
        }
    </style>
</head>

<body>
    <div class="wrap">
        <div class="header">
            <div class="title">Pixel Retro Store — Recibo</div>
            <div class="muted">Recibo N°: #{{ $sale->id }} &nbsp;|&nbsp; Fecha:
                {{ $sale->created_at->format('d/m/Y H:i') }}</div>
            <div class="muted">Ref. de pago: {{ $sale->payment_ref ?? '—' }}</div>
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
                    <th class="right">P. Unit</th>
                    <th class="right">Subtotal</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($sale->details as $d)
                    <tr>
                        <td>{{ $d->product->name ?? '#' . $d->product_id }}</td>
                        <td class="right">{{ $d->quantity }}</td>
                        <td class="right">Bs. {{ number_format($d->unit_price, 2) }}</td>
                        <td class="right">Bs. {{ number_format($d->subtotal, 2) }}</td>
                    </tr>
                @endforeach
            </tbody>
            <tfoot>
                <tr>
                    <td colspan="3" class="right"><strong>Total</strong></td>
                    <td class="right"><strong>Bs. {{ number_format($sale->total, 2) }}</strong></td>
                </tr>
            </tfoot>
        </table>

        <p class="muted" style="margin-top:14px;">
            Gracias por tu compra. Conserva este comprobante para tu registro.
        </p>
    </div>
</body>

</html>
