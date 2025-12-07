@component('mail::message')
    # ¡Gracias por tu compra, {{ $sale->customer?->name ?? 'gamer' }}!

    Tu pedido fue **confirmado**.

    **Venta:** #{{ $sale->id }}
    **Referencia de pago:** {{ $sale->payment_ref ?? '—' }}
    **Fecha:** {{ $sale->created_at->format('d/m/Y H:i') }}

    @component('mail::table')
        | Producto | Cant. | P. Unit | Subtotal |
        |:--|:--:|--:|--:|
        @foreach ($sale->details as $d)
            | {{ $d->product?->name ?? '#' . $d->product_id }} | {{ $d->quantity }} | Bs.
            {{ number_format((float) $d->unit_price, 2) }} | Bs. {{ number_format((float) $d->subtotal, 2) }} |
        @endforeach
    @endcomponent

    **Total:** Bs. {{ number_format((float) $sale->total, 2) }}

    @component('mail::button', ['url' => rtrim($frontendUrl, '/') . '/account/orders/' . $sale->id])
        Ver mi compra
    @endcomponent

    Si no realizaste esta compra, por favor contáctanos.

    Gracias por elegir **Pixel Retro Store**.
@endcomponent
