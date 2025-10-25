<!doctype html>
<html lang="es">

<head>
    <meta charset="utf-8">
    <title>Reporte de Ventas</title>
    <style>
        @page {
            margin: 24mm 15mm 20mm;
        }

        body {
            font-family: "DejaVu Sans", sans-serif;
            font-size: 12px;
            color: #0b1224;
        }

        .header {
            position: fixed;
            top: -18mm;
            left: 0;
            right: 0;
            height: 18mm;
        }

        .footer {
            position: fixed;
            bottom: -14mm;
            left: 0;
            right: 0;
            height: 14mm;
            font-size: 10px;
            color: #6b7280;
        }

        .muted {
            color: #6b7280;
        }

        .text-right {
            text-align: right;
        }

        .text-center {
            text-align: center;
        }

        .title {
            font-size: 18px;
            font-weight: bold;
            margin: 0 0 2px;
        }

        .logo {
            height: 22px;
        }

        table.cards {
            width: 100%;
            border-collapse: collapse;
            margin: 10px 0 14px;
        }

        table.cards td {
            padding-right: 10px;
            vertical-align: top;
        }

        table.cards td.last {
            padding-right: 0;
        }

        .card {
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 10px 12px;
        }

        .card .label {
            font-size: 11px;
            color: #6b7280;
        }

        .card .value {
            font-size: 16px;
            font-weight: bold;
            color: #0ea5a3;
        }

        .pill {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 999px;
            font-size: 10px;
            border: 1px solid #ddd;
        }

        .pill-paid {
            color: #065f46;
            border-color: #10b981;
            background: #ecfdf5;
        }

        .pill-pending {
            color: #92400e;
            border-color: #f59e0b;
            background: #fffbeb;
        }

        .pill-failed {
            color: #991b1b;
            border-color: #ef4444;
            background: #fef2f2;
        }

        table.table {
            width: 100%;
            border-collapse: collapse;
        }

        .table th,
        .table td {
            padding: 7px 8px;
            border: 1px solid #e5e7eb;
        }

        .table th {
            background: #f8fafc;
            text-align: left;
            font-weight: bold;
            font-size: 12px;
        }
    </style>
</head>

<body>
    <div class="header">
        <table style="width:100%;">
            <tr>
                <td>
                    @if (!empty($logo))
                        <img class="logo" src="{{ $logo }}" alt="Logo">
                    @else
                        <strong>Pixel Retro Store</strong>
                    @endif
                </td>
                <td class="text-right">
                    <div class="title">Reporte de ventas</div>
                    <div class="muted">Rango: {{ $from }} — {{ $to }}</div>
                </td>
            </tr>
        </table>
    </div>

    <div class="footer">
        <table style="width:100%;">
            <tr>
                <td>Generado: {{ now()->format('Y-m-d H:i') }}</td>
            </tr>
        </table>
    </div>

    <table class="cards">
        <tr>
            <td>
                <div class="card">
                    <div class="label">Total dinero recaudado (paid)</div>
                    <div class="value">Bs. {{ number_format($summary['recaudado'], 2, ',', '.') }}</div>
                </div>
            </td>
            <td>
                <div class="card">
                    <div class="label">Ventas</div>
                    <div class="value">{{ $summary['ventas_total'] }} ventas</div>
                    <div class="muted" style="margin-top:4px;">
                        <span class="pill pill-paid">Pagadas: {{ $summary['paid']['count'] }}</span>
                        &nbsp;<span class="pill pill-pending">Pend.: {{ $summary['pending']['count'] }}</span>
                        &nbsp;<span class="pill pill-failed">Fallidas: {{ $summary['failed']['count'] }}</span>
                    </div>
                </div>
            </td>
            <td class="last">
                <div class="card">
                    <div class="label">Productos</div>
                    <div class="value">{{ $products['total_qty'] }} ítems</div>
                    <div class="muted" style="margin-top:4px;">Distintos: {{ $products['distinct'] }}</div>
                </div>
            </td>
        </tr>
    </table>

    <table class="table">
        <thead>
            <tr>
                <th style="width:50px;">Nro</th>
                <th style="width:120px;">Fecha</th>
                <th>Cliente</th>
                <th>Email</th>
                <th class="text-center" style="width:70px;">Estado</th>
                <th class="text-center" style="width:60px;">Ítems</th>
                <th class="text-right" style="width:90px;">Total</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($rows as $s)
                <tr>
                    <td>#{{ $s->id }}</td>
                    <td>{{ optional($s->created_at)->format('Y-m-d H:i:s') }}</td>
                    <td>{{ $s->customer->name ?? '—' }}</td>
                    <td class="muted">{{ $s->customer->email ?? '—' }}</td>
                    <td class="text-center">
                        @if ($s->status === 'paid')
                            <span class="pill pill-paid">PAID</span>
                        @elseif($s->status === 'pending')
                            <span class="pill pill-pending">PENDING</span>
                        @else
                            <span class="pill pill-failed">FAILED</span>
                        @endif
                    </td>
                    <td class="text-center">{{ (int) ($s->items_qty ?? 0) }}</td>
                    <td class="text-right">Bs. {{ number_format((float) $s->total, 2, ',', '.') }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>
</body>

</html>
