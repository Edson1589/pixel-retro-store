<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="utf-8">
    <style>
        body {
            font-family: system-ui, -apple-system, sans-serif;
            color: #111;
        }

        .box {
            max-width: 480px;
            margin: 0 auto;
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 16px;
        }

        .title {
            font-size: 16px;
            font-weight: 700;
        }

        .muted {
            color: #666;
            font-size: 13px;
            line-height: 1.4;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 12px;
            font-size: 13px;
        }

        th,
        td {
            border: 1px solid #e5e5e5;
            padding: 6px 8px;
            text-align: left;
        }

        th {
            background: #f8f8f8;
            font-weight: 600;
        }

        .right {
            text-align: right;
        }

        .total-row td {
            font-weight: 600;
            background: #f8f8f8;
        }
    </style>
</head>

<body>
    <div class="box">
        <div class="title">Nueva venta #{{ $sale->id }} 💸</div>
        <div class="muted">
            Fecha: {{ $sale->created_at?->format('d/m/Y H:i') }}<br>
            Ref. Pago: {{ $sale->payment_ref ?? '—' }}<br>
            Estado: {{ strtoupper($sale->status) }}<br>
            Cliente: {{ $sale->customer->name ?? '—' }} ({{ $sale->customer->email ?? '—' }})
        </div>

        <table>
            <thead>
                <tr>
                    <th>Producto</th>
                    <th class="right">Cant.</th>
                    <th class="right">P.Unit</th>
                    <th class="right">Subtotal</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($sale->details as $d)
                    <tr>
                        <td>
                            {{ $d->product->name ?? '#' . $d->product_id }}
                            @if (!empty($d->product?->sku))
                                <div style="color:#777; font-size:11px;">SKU: {{ $d->product->sku }}</div>
                            @endif
                        </td>
                        <td class="right">{{ $d->quantity }}</td>
                        <td class="right">Bs. {{ number_format($d->unit_price, 2, ',', '.') }}</td>
                        <td class="right">Bs. {{ number_format($d->subtotal, 2, ',', '.') }}</td>
                    </tr>
                @endforeach
            </tbody>
            <tfoot>
                <tr class="total-row">
                    <td colspan="3" class="right">Total</td>
                    <td class="right">Bs. {{ number_format($sale->total, 2, ',', '.') }}</td>
                </tr>
            </tfoot>
        </table>

        <p class="muted" style="margin-top:16px;">
            ID cliente: {{ $sale->customer_id ?? '—' }}
        </p>

        <p style="font-size:12px; color:#888; text-align:center; margin-top:24px;">
            Pixel Retro Store — Notificación interna
        </p>
    </div>
</body>

</html>
