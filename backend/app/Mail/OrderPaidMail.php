<?php

namespace App\Mail;

use App\Models\Sale;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class OrderPaidMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(public Sale $sale) {}

    public function build()
    {
        $this->sale->loadMissing(['customer', 'details.product']);
        $url = config('app.frontend_url');

        return $this->subject('Gracias por tu compra #' . $this->sale->id . ' – Pixel Retro Store')
            ->markdown('emails.orders.paid', [
                'sale'        => $this->sale,
                'frontendUrl' => $url,
            ]);
    }
}
